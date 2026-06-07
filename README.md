# Smart Medicine Inventory Monitoring and Expiry Alert System 🏥📦

A modern, web-based inventory management and expiry tracking system designed for pharmacies, hospitals, and clinics. This system enables healthcare providers to monitor medicine stocks at the batch level, track expiry dates, manage supplier relationships, create purchase orders, automate expiry and stock alerts, and generate deep inventory insights.

---

## 🌟 Key Features

*   **Batch-Level Inventory Tracking**: Track quantities, costs, manufacturing, and expiry dates batch-wise for all medicines.
*   **Automatic Expiry & Stock Alerts**: Automated background cron jobs evaluate inventory health and trigger alert notifications (`INFO`, `WARNING`, `CRITICAL`) for expiring, expired, or low-stock items.
*   **Audit Trail & Stock Movements**: Comprehensive audit log recording every inventory change (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `EXPIRED`, `RETURNED`).
*   **Supplier & Purchase Order Management**: Streamlined workflow to manage suppliers and draft, order, receive, or cancel purchase orders.
*   **Role-Based Access Control (RBAC)**: Secure access system supporting different roles (`ADMIN`, `PHARMACIST`, `STAFF`) with tailored permissions.
*   **Smart Insights Engine**: Analytics for identifying dead stock, low-stock reorder thresholds, expiry risks, and overall inventory health.
*   **Bulk Data Import**: Preview and commit inventory and medicine catalogs via CSV or Excel spreadsheets.
*   **Interactive Reports**: Real-time visualization of stock history, expiry risks, supplier reliability, and stock levels.

---

## 🏗️ Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
*   **Routing & SSR**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) & [TanStack Router](https://tanstack.com/router)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
*   **State Management & Data Fetching**: [React Query](https://tanstack.com/query) & [Axios](https://axios-http.com/)
*   **Visualizations**: [Recharts](https://recharts.org/) (for interactive dashboards)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/) with [Express.js v5](https://expressjs.com/) & [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM**: [Prisma ORM](https://www.prisma.io/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Authentication**: JWT (JSON Web Tokens) & `bcrypt` for secure password hashing
*   **Scheduler**: `node-cron` for automated alert checks
*   **Parsers**: `xlsx` & `csv-parser` for spreadsheet imports

---

## 📁 Project Structure

```text
├── backend/                   # Node.js + Express + TypeScript Backend
│   ├── prisma/                # Prisma schema and migrations
│   │   ├── schema.prisma      # PostgreSQL Database Schema
│   │   └── migrations/        # Database migration history
│   └── src/                   # Backend source files
│       ├── modules/           # Module-specific controllers, services, routes
│       ├── seed.ts            # Database seeding script
│       └── server.ts          # Express Server configuration and startup
├── frontend/                  # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI Components (ShadCN)
│   │   ├── routes/            # TanStack Router File-Based Routing
│   │   └── lib/               # Utility functions and services (Axios, API helpers)
│   └── vite.config.ts         # Vite bundler configuration
├── docs/                      # Comprehensive Design & Contract Documentation
│   ├── architecture.md        # System architecture overview
│   ├── database-design.md     # DB schema definitions
│   └── api-contracts.md       # Rest API contracts and contracts detail
└── package.json               # Root scripts for running server/client concurrently
```

---

## 💾 Database Schema Overview

The database uses **PostgreSQL** with UUID primary keys. For details, refer to the [Database Design Documentation](docs/database-design.md). Key entities include:

*   **`users`**: System users and their roles (`ADMIN`, `PHARMACIST`, `STAFF`).
*   **`medicines`**: Master medicine catalog.
*   **`suppliers`**: Supplier details.
*   **`inventory_batches`**: Tracks stock batch-wise with quantity, unit cost, and expiry dates.
*   **`stock_movements`**: Audit trails of inventory inflows/outflows.
*   **`alerts`**: System-generated warnings (expiry risk, low stock, dead stock).
*   **`purchase_orders`** & **`purchase_order_items`**: Purchase requisitions.
*   **`notifications`**: Real-time user notifications.

---

## 🔌 API Reference

All requests are prefixed with `/api`. For exact schemas, payload structures, and response samples, refer to the [API Contracts Documentation](docs/api-contracts.md).

*   **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
*   **Users**: `/api/users` (CRUD user accounts, Admin only)
*   **Medicines**: `/api/medicines` (CRUD)
*   **Suppliers**: `/api/suppliers` (CRUD)
*   **Inventory Batches**: `/api/inventory` (CRUD, status filtering, and query parameter search)
*   **Stock Movements**: `/api/stock-movements` (CRUD and quantity adjustment transaction logging)
*   **Alerts**: `/api/alerts` (List and resolve notifications)
*   **Purchase Orders**: `/api/orders` (CRUD)
*   **Dashboard & Reports**: `/api/dashboard/summary`, `/api/reports/summary` (Category, expiry splits, supplier metrics, and movement sums)
*   **Imports**: `/api/imports/preview`, `/api/imports/commit`
*   **Insights**: `/api/insights/*` (Expiry risks, reorder thresholds, inventory health)

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [PostgreSQL](https://www.postgresql.org/) database instance

### 1. Install Dependencies
Run the install command from the **root directory** to install packages for the root project, backend, and frontend concurrently:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder based on `.env.example`:
```bash
cp backend/.env.example backend/.env
```
Update the values in `backend/.env` with your Postgres credentials and custom JWT secret:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/medicine_inventory_db
JWT_SECRET=your_super_secure_jwt_secret_key
```

### 3. Setup Database (Migrations & Seed)
Navigate to the `backend` folder and run the Prisma migrations to set up the database tables, then run the seed script to populate initial setup data (like default roles or admin accounts):
```bash
cd backend

# Run Prisma database migrations
npx prisma migrate dev --name init

# Seed the database
npm run seed
```

### 4. Run the Application
From the **root directory**, start both the frontend client and the backend server concurrently:
```bash
npm start
```
*   **Frontend client** runs on `http://localhost:3000` (or the port specified by Vite/TanStack Start).
*   **Backend server** runs on `http://localhost:5000` (or configured API port).

---

## 🔒 License

This project is licensed under the ISC License. See the packages for more details.
