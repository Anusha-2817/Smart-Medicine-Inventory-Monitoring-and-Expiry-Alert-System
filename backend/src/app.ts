import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";

import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import medicineRoutes from "./modules/medicine/medicine.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import supplierRoutes from "./modules/supplier/supplier.routes";
import orderRoutes from "./modules/purchase-order/order.routes";
import alertRoutes from "./modules/alert/alert.routes";
import importExportRoutes from "./modules/import-export/import-export.routes";
import stockMovementRoutes from "./modules/stock-movement/stock-movement.routes";
import reportRoutes from "./modules/report/report.routes";
import userRoutes from "./modules/user/user.routes";
import demoRoutes from "./modules/demo/demo.routes";
import auditRoutes from "./modules/audit/audit.routes";
import searchRoutes from "./modules/search/search.routes";

const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. same-origin, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
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
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/search", searchRoutes);
app.use("/api", importExportRoutes);

// Serve frontend static files for single-service deployments
const publicPath = path.join(process.cwd(), "public");
// console.log("PUBLIC PATH =", publicPath);
// console.log("INDEX EXISTS =", fs.existsSync(path.join(publicPath, "index.html")));
// console.log("ASSETS EXISTS =", fs.existsSync(path.join(publicPath, "assets")));


app.use(express.static(publicPath));

// SPA fallback: for any GET request that is not an API call, serve index.html (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api")) return next();
  if (/\.[a-zA-Z0-9]+$/.test(req.path)) return next();
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) return next(err);
  });
});

export default app;
