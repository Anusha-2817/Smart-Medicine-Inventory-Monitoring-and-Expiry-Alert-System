import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import medicineRoutes from "./modules/medicine/medicine.routes";
import supplierRoutes from "./modules/suppliers/suppliers.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import stockMovementRoutes from "./modules/stock-movements/stock-movement.routes";
import alertRoutes from "./modules/alerts/alerts.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import purchaseOrderRoutes from "./modules/purchase-orders/purchase-order.routes";
import exportRoutes from "./modules/exports/export.routes";
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("HELLO ANUSHA TEST");
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory-batches",inventoryRoutes);
app.use("/api/stock-movements",stockMovementRoutes);
app.use("/api/alerts",alertRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/purchase-orders",purchaseOrderRoutes);
app.use("/api/exports",exportRoutes);

export default app;