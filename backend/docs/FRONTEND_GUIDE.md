# FRONTEND_GUIDE.md

# Smart Medicine Inventory Monitoring & Expiry Alert System

# Git Workflow

1. Pull latest changes from repository.
2. Create a new branch from purchase-orders (or main if backend is merged).
3. Implement frontend changes on your branch.
4. Push your branch and create a pull request.

## Project Overview

This frontend connects to a completed Node.js + Express + Prisma backend.

Primary objective:

* Track medicine inventory
* Monitor batch expiries
* Generate expiry alerts
* Manage suppliers
* Manage purchase orders
* Track stock movement history
* Support bulk import/export

---

# Recommended Frontend Stack

* React + Vite
* TypeScript
* Tailwind CSS
* React Router
* Axios
* React Query
* Recharts

Backend URL:

http://localhost:5000

---

# Authentication

Login endpoint returns JWT.

Store JWT in localStorage.

Send on every protected request:

Authorization: Bearer <token>

---

# Frontend Pages

## 1. Login

Purpose:

Authenticate users and store JWT.

Features:

* Email input
* Password input
* Login button

After login:

Redirect to Dashboard.

---

## 2. Dashboard

Purpose:

System overview.

Display:

### KPI Cards

* Total Medicines
* Total Inventory Batches
* Low Stock Medicines
* Expiring Soon
* Expired Medicines
* Suppliers

### Charts

Stock Distribution

Example:

Paracetamol -> 500

Amoxicillin -> 250

Cetirizine -> 300

Expiry Trend

Example:

June -> 5

July -> 8

August -> 12

### Recent Activity

Show:

* Medicine Created
* Stock Added
* Alert Generated
* Purchase Order Created

---

## 3. Medicines

Purpose:

Medicine Master Data Management.

Columns:

* Name
* Generic Name
* Category
* Manufacturer
* SKU
* Prescription Required
* Reorder Threshold
* Status

Actions:

* Add
* Edit
* Delete
* View

Filters:

* Search
* Category
* Status

Expected Backend Routes

GET /api/medicines

GET /api/medicines/:id

POST /api/medicines

PUT /api/medicines/:id

DELETE /api/medicines/:id

---

## 4. Inventory

Purpose:

Track medicine batches.

Columns:

* Medicine
* Batch Number
* Quantity
* Manufacture Date
* Expiry Date
* Supplier
* Status

Status Colors:

Safe = Green

Low Stock = Orange

Expiring Soon = Yellow

Expired = Red

Filters:

* Medicine
* Supplier
* Status
* Expiry Range

Expected Backend Routes

GET /api/inventory

GET /api/inventory/:id

POST /api/inventory

PUT /api/inventory/:id

DELETE /api/inventory/:id

---

## 5. Suppliers

Purpose:

Supplier Management.

Columns:

* Name
* Phone
* Email
* Address

Actions:

* Add
* Edit
* Delete

Expected Backend Routes

GET /api/suppliers

GET /api/suppliers/:id

POST /api/suppliers

PUT /api/suppliers/:id

DELETE /api/suppliers/:id

---

## 6. Purchase Orders

Purpose:

Medicine procurement workflow.

Columns:

* Supplier
* Order Date
* Expected Delivery
* Status

Status:

* Pending
* Approved
* Delivered
* Cancelled

Actions:

* Create Purchase Order
* View Order
* Update Status

Expected Backend Routes

GET /api/purchase-orders

GET /api/purchase-orders/:id

POST /api/purchase-orders

PATCH /api/purchase-orders/:id

---

## 7. Stock Movements

Purpose:

Inventory audit trail.

Columns:

* Date
* Medicine
* Batch
* Movement Type
* Quantity
* Notes
* User

Movement Types:

* STOCK_IN
* STOCK_OUT
* ADJUSTMENT

Expected Backend Routes

GET /api/stock-movements

GET /api/stock-movements/:id

POST /api/stock-movements/stock-in

POST /api/stock-movements/stock-out

POST /api/stock-movements/adjustment

Important:

Inventory quantities should NOT be edited directly.

All quantity changes must go through stock movement actions.

---

## 8. Alerts

Purpose:

Expiry monitoring system.

Display Summary Cards:

* Expired
* Within 7 Days
* Within 30 Days
* Within 90 Days

Table Columns:

* Medicine
* Batch
* Expiry Date
* Days Left
* Severity

Severity Levels:

SAFE

WARNING

CRITICAL

EXPIRED

Expected Backend Routes

GET /api/alerts

PATCH /api/alerts/:id

---

## 9. Notifications

Purpose:

Show generated system notifications.

Examples:

* Low stock detected
* Expiry warning generated
* Purchase order created

Expected Backend Routes

GET /api/notifications

PATCH /api/notifications/:id/read

PATCH /api/notifications/read-all

---

## 10. Import / Export

Purpose:

Bulk data operations.

### Import

Supported:

* CSV
* Excel (.xlsx)

Upload Method:

multipart/form-data

Field Name:

file

Expected Route:

POST /api/imports/medicines

Display:

* Total Records
* Imported
* Failed
* Failed Rows

### Export

Buttons:

Export CSV

GET /api/exports/medicines/csv

Export Excel

GET /api/exports/medicines/excel

---

# Sidebar Navigation

Dashboard

Medicines

Inventory

Stock Movements

Suppliers

Purchase Orders

Alerts

Notifications

Import / Export

---

# MVP Priority

Build in this order:

1. Authentication
2. Dashboard Layout
3. Medicines
4. Suppliers
5. Inventory
6. Purchase Orders
7. Alerts
8. Import / Export
9. Notifications
10. Dashboard Charts

---

# Notes

Backend is modular and already implemented.

Focus on consuming APIs and displaying data.

Expiry calculations, alerts, notifications, stock updates, imports, exports, and inventory rules already exist in backend.