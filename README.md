# TopSell Shop — Full-Stack E-Commerce

A complete e-commerce platform built with **Next.js 14**, **Node.js/Express**, and **Supabase Postgres**.

## Project Structure

```text
topsell.shop/
├── frontend/          # Next.js 14 App Router (deploy to Vercel)
└── backend/           # Node.js + Express REST API (deploy to Railway)
```

## Local Development

### 1) Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## Production Deploy (Vercel + Railway)

### Overview

- **Frontend** → Vercel
- **Backend API** → Railway
- **Database** → Supabase Postgres

### Step A — Deploy backend to Railway

1. Push this repo to GitHub.
2. In Railway, create a **New Project** and select this GitHub repo.
3. Set **Root Directory** to `backend`.
4. Add environment variables from `backend/.env.example`:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=7d`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `DATABASE_URL=...`
   - `FRONTEND_URL` (set after Vercel URL is known)
   - `ALLOWED_ORIGINS` (optional, comma-separated extra domains)
   - `ALLOW_VERCEL_PREVIEW` (`true` to allow `*.vercel.app` preview URLs)
5. Deploy. Copy the generated Railway domain, e.g.:
   - `https://your-backend.railway.app`
6. Run DB migration once (Railway shell or local machine):

```bash
cd backend
npm install
npm run migrate
```

Health check URL:

```text
https://your-backend.railway.app/health
```

### Step B — Deploy frontend to Vercel

1. In Vercel, import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable from `frontend/.env.example`:
   - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
4. Deploy and copy the Vercel URL, e.g.:
   - `https://your-shop.vercel.app`

### Step C — Connect CORS correctly

Update Railway backend CORS env vars:

```text
FRONTEND_URL=https://your-shop.vercel.app
ALLOWED_ORIGINS=https://shop.example.com
ALLOW_VERCEL_PREVIEW=true
```

- `FRONTEND_URL` is required (main live domain).
- `ALLOWED_ORIGINS` is optional for extra domains.
- `ALLOW_VERCEL_PREVIEW=true` is useful if you test from Vercel preview links.

Redeploy backend after changing env vars.

### Step D — Quick production test

- Open frontend URL and browse products.
- Register/login.
- Add product to cart.
- Place a test order.
- Check backend logs in Railway if any API call fails.

---

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
| Database | Supabase Postgres |
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
