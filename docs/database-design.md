# Database Design

## Database

PostgreSQL

## Primary Key Strategy

All tables use UUID primary keys.

---

# users

Purpose:
System users.

Columns:

id
name
email
password_hash
role
is_active
created_at
updated_at

Role Values:

ADMIN
PHARMACIST
STAFF

---

# medicines

Purpose:
Master medicine catalog.

Columns:

id
name
generic_name
category
manufacturer
sku
requires_prescription
reorder_threshold
created_at
updated_at

---

# suppliers

Purpose:
Medicine suppliers.

Columns:

id
name
contact_person
phone
email
address
created_at
updated_at

---

# inventory_batches

Purpose:
Tracks stock batch-wise.

Columns:

id
medicine_id
supplier_id
batch_number
quantity
unit_cost
manufacturing_date
expiry_date
status
created_at
updated_at

Status Values:

ACTIVE
EXPIRING
EXPIRED

---

# stock_movements

Purpose:
Audit trail of inventory changes.

Columns:

id
batch_id
user_id
movement_type
quantity
notes
created_at

Movement Types:

STOCK_IN
STOCK_OUT
ADJUSTMENT
EXPIRED
RETURNED

---

# alerts

Purpose:
System generated alerts.

Columns:

id
batch_id
alert_type
severity
message
is_resolved
created_at

Alert Types:

EXPIRY
LOW_STOCK
DEAD_STOCK

Severity:

INFO
WARNING
CRITICAL

---

# purchase_orders

Purpose:
Supplier purchase requests.

Columns:

id
supplier_id
created_by
status
created_at
updated_at

Status:

DRAFT
ORDERED
RECEIVED
CANCELLED

---

# purchase_order_items

Purpose:
Medicines within purchase orders.

Columns:

id
purchase_order_id
medicine_id
quantity
unit_price

---

# notifications

Purpose:
User notifications.

Columns:

id
user_id
title
message
type
is_read
created_at

Type:

INFO
WARNING
CRITICAL

---

# Relationships

Medicine
1 → Many Inventory Batches

Supplier
1 → Many Inventory Batches

Inventory Batch
1 → Many Stock Movements

Inventory Batch
1 → Many Alerts

Supplier
1 → Many Purchase Orders

Purchase Order
1 → Many Purchase Order Items

Medicine
1 → Many Purchase Order Items

User
1 → Many Notifications

User
1 → Many Stock Movements