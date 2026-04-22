const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { authenticate, requireAdmin } = require('../middleware/auth');

// --- Cloudinary config (only active when all 3 env vars are set) -------------
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

const useCloudinary = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

// Memory storage when using Cloudinary; disk storage as fallback.
const upload = useCloudinary
  ? multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase())
          && allowed.test(file.mimetype);
        cb(ok ? null : new Error('Only images allowed'), ok);
      },
    })
  : (() => {
      // Ensure ./uploads exists for the local fallback.
      try { fs.mkdirSync('uploads', { recursive: true }); } catch {}
      return multer({
        storage: multer.diskStorage({
          destination: (req, file, cb) => cb(null, 'uploads/'),
          filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + path.extname(file.originalname));
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const allowed = /jpeg|jpg|png|gif|webp/;
          const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
          cb(ok ? null : new Error('Only images allowed'), ok);
        },
      });
    })();

// Upload a single buffer to Cloudinary via upload_stream.
function streamUpload(buffer, folder = 'topsell/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/uploads — multiple images (legacy "images" field).
router.post('/', authenticate, requireAdmin, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    let urls;
    if (useCloudinary) {
      const results = await Promise.all(req.files.map((f) => streamUpload(f.buffer)));
      urls = results.map((r) => r.secure_url);
    } else {
      urls = req.files.map((f) => `/uploads/${f.filename}`);
    }
    res.json({ urls });
  } catch (err) {
    next(err);
  }
});

// POST /api/uploads/single — single image, returns { url }. Used by new admin UI.
router.post('/single', authenticate, requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const url = useCloudinary
      ? (await streamUpload(req.file.buffer)).secure_url
      : `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
