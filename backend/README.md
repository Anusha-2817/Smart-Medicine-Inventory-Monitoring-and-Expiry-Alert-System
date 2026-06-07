# Smart Medicine Inventory Monitoring System

## Setup

1. Clone repository
2. Install dependencies

npm install

3. Configure .env

DATABASE_URL=
JWT_SECRET=

4. Run migrations

npx prisma migrate dev

5. Start backend

npm run dev

Server runs on:

http://localhost:5000

## Modules

* Authentication
* Medicines
* Inventory
* Suppliers
* Purchase Orders
* Stock Movements
* Alerts
* Notifications
* Import / Export
* Dashboard
