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

const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.use(errorHandler);

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
