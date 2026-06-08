import { Router } from "express";
import { getInventory, getExpiry, getSuppliers, getMovements, getSummary } from "./report.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/summary", authenticate, getSummary);
router.get("/inventory", authenticate, getInventory);
router.get("/expiry", authenticate, getExpiry);
router.get("/suppliers", authenticate, getSuppliers);
router.get("/stock-movements", authenticate, getMovements);
export default router;
