import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import medicineRoutes from "./modules/medicine/medicine.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import supplierRoutes from "./modules/supplier/supplier.routes";
import orderRoutes from "./modules/purchase-order/order.routes";
import alertRoutes from "./modules/alert/alert.routes";
import importExportRoutes from "./modules/import-export/import-export.routes";

const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "MediStock API Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api", importExportRoutes);

export default app;