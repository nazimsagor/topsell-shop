require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/db');   // supabase client + health-check

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const categoryRoutes = require('./src/routes/categories');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');
const uploadRoutes = require('./src/routes/uploads');

const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean),
].filter(Boolean);

const isVercelPreviewAllowed = process.env.ALLOW_VERCEL_PREVIEW === 'true';

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true); // server-to-server / curl / health checks

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (isVercelPreviewAllowed && /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: {
      exactOrigins: allowedOrigins,
      allowVercelPreview: isVercelPreviewAllowed,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Allowed CORS origins:', allowedOrigins.length ? allowedOrigins : '[none set]');
    console.log('Allow Vercel preview domains:', isVercelPreviewAllowed);
  });
}

start();
