import { Router } from "express";
import { exportCSV, exportInventoryCSV } from "./import-export.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/export/medicines", authenticate, exportCSV);
router.get("/export/inventory", authenticate, exportInventoryCSV);
export default router;
