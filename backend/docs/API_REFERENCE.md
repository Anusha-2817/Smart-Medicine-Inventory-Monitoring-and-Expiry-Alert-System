# Smart Medicine Inventory Monitoring and Expiry Alert System - API Reference

## Base URL

http://localhost:5000/api

---

## Authentication

### Register

POST /auth/register

### Login

POST /auth/login

### Profile

GET /auth/profile

Authorization: Bearer Token

---

## Medicines

GET /medicines

GET /medicines/:id

POST /medicines

PUT /medicines/:id

DELETE /medicines/:id

---

## Suppliers

GET /suppliers

GET /suppliers/:id

POST /suppliers

PUT /suppliers/:id

DELETE /suppliers/:id

---

## Inventory Batches

GET /inventory-batches

GET /inventory-batches/:id

POST /inventory-batches

PUT /inventory-batches/:id

DELETE /inventory-batches/:id

---

## Stock Movements

GET /stock-movements

GET /stock-movements/:id

POST /stock-movements/stock-in

POST /stock-movements/stock-out

POST /stock-movements/adjustment

---

## Alerts

GET /alerts

POST /alerts/generate-expiry

POST /alerts/generate-low-stock

PATCH /alerts/:id/resolve

---

## Notifications

GET /notifications

PATCH /notifications/:id/read

PATCH /notifications/read-all

---

## Purchase Orders

GET /purchase-orders

GET /purchase-orders/:id

POST /purchase-orders

PATCH /purchase-orders/:id/status

---

## Imports

POST /imports/medicines

---

## Exports

GET /exports/medicines/csv

GET /exports/medicines/excel
