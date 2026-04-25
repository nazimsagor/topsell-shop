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
const paymentRoutes = require('./src/routes/payment');
const couponRoutes = require('./src/routes/coupons');
const adminCouponRoutes = require('./src/routes/adminCoupons');
const bannerRoutes = require('./src/routes/banners');
const settingsRoutes = require('./src/routes/settings');
const newsletterRoutes = require('./src/routes/newsletter');

const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://topsell-shop-227t.vercel.app',
  'https://topsell-shop.vercel.app',
  'http://localhost:3000',
];
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(errorHandler);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// On Vercel (serverless) the platform imports this module and invokes the
// exported Express app as a handler — we must NOT call app.listen().
// Locally (node server.js / nodemon) we start a real HTTP listener.
if (!process.env.VERCEL) {
  start();
}

module.exports = app;
