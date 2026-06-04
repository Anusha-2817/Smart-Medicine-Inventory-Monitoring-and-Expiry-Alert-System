# API Contracts

Base URL

/api

---

# Authentication

POST /auth/register

POST /auth/login

GET /auth/profile

---

# Medicines

GET /medicines

GET /medicines/:id

POST /medicines

PUT /medicines/:id

DELETE /medicines/:id

---

# Suppliers

GET /suppliers

GET /suppliers/:id

POST /suppliers

PUT /suppliers/:id

DELETE /suppliers/:id

---

# Inventory Batches

GET /batches

GET /batches/:id

POST /batches

PUT /batches/:id

DELETE /batches/:id

---

# Batch Filters

GET /batches?status=expired

GET /batches?status=expiring

GET /batches?status=active

GET /batches?medicineId=

GET /batches?supplierId=

---

# Stock Movements

GET /stock-movements

GET /stock-movements/:id

POST /stock-movements

---

# Alerts

GET /alerts

GET /alerts/:id

PUT /alerts/:id/resolve

---

# Purchase Orders

GET /purchase-orders

GET /purchase-orders/:id

POST /purchase-orders

PUT /purchase-orders/:id

DELETE /purchase-orders/:id

---

# Notifications

GET /notifications

PUT /notifications/:id/read

---

# Dashboard

GET /dashboard/summary

Expected Response:

{
  totalMedicines,
  totalBatches,
  lowStockCount,
  expiringCount,
  expiredCount
}

---

# Reports

GET /reports/inventory

GET /reports/expiry

GET /reports/suppliers

GET /reports/stock-movements

---

# Import Center

POST /imports/preview

POST /imports/commit

---

# Smart Insights

GET /insights/reorder

GET /insights/expiry-risk

GET /insights/dead-stock

GET /insights/inventory-health