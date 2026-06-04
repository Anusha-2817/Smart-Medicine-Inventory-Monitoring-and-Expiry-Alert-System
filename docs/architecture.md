# Smart Medicine Inventory Monitoring and Expiry Alert System

## Project Overview

A web-based inventory management system designed for pharmacies, hospitals, and clinics to monitor medicine stock, track expiry dates, manage suppliers, generate alerts, and provide inventory insights.

---

## Objectives

- Track medicines batch-wise
- Monitor expiry dates
- Generate expiry alerts
- Manage suppliers
- Manage purchase orders
- Maintain stock movement history
- Support CSV/Excel imports
- Generate reports and analytics

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI
- React Query
- Axios

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL

### ORM

- Prisma

### Authentication

- JWT
- bcrypt

### Scheduling

- node-cron

### File Imports

- xlsx
- csv-parser

---

## System Architecture

Frontend
↓
REST API
↓
Express Backend
↓
Prisma ORM
↓
PostgreSQL

---

## Core Modules

1. Authentication
2. Medicine Catalog
3. Supplier Management
4. Inventory Batch Management
5. Stock Movement Tracking
6. Expiry Alert System
7. Purchase Orders
8. Notifications
9. Reports
10. Import Center
11. Smart Insights

---

## Inventory Design Philosophy

Inventory is tracked at batch level.

Medicine
↓
Inventory Batch
↓
Stock Movement

Example:

Paracetamol

Batch A001
Expiry: 2027
Qty: 100

Batch A002
Expiry: 2028
Qty: 50

Both batches belong to the same medicine.

---

## Roles

ADMIN
PHARMACIST
STAFF

---

## Naming Conventions

Database Tables:
snake_case

Database Columns:
snake_case

TypeScript Variables:
camelCase

React Components:
PascalCase

API Routes:
plural nouns

Example:

/api/medicines
/api/suppliers
/api/batches