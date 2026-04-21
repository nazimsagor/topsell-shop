# TopSell Shop — Full-Stack E-Commerce

A complete e-commerce platform built with **Next.js 14**, **Node.js/Express**, and **PostgreSQL**.

## Project Structure

```
topsell.shop/
├── frontend/          # Next.js 14 App Router
└── backend/           # Node.js + Express REST API
```

## Quick Start

### 1. Setup PostgreSQL

Create a database named `topsell_db` and run the migration:

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npm run migrate
```

### 2. Start Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 3. Start Frontend

```bash
cd frontend
cp .env.local .env.local
# Edit with your API URL
npm install
npm run dev
# Runs on http://localhost:3000
```

## Features

### Customer-facing
- Browse products with filters (category, price, search, sort)
- Product detail with image gallery, variants, reviews
- Shopping cart (persists across sessions)
- Checkout with shipping address
- User account: orders, wishlist, addresses
- JWT authentication

### Admin Panel (`/admin`)
- Dashboard with stats (revenue, orders, customers, products)
- Product management (CRUD)
- Order management & status updates
- Default admin: `admin@topsell.shop` / `Admin@123`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Zustand, React Hook Form |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Payments | Stripe (wired up, needs keys) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | List products (paginated) |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/cart/items` | Add to cart |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | User's orders |
