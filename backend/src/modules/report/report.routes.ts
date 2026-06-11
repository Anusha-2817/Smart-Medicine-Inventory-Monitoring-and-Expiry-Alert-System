import { Router } from "express";
import { getInventory, getExpiry, getSuppliers, getMovements, getSummary } from "./report.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/summary", authenticate, authorize("ADMIN", "PHARMACIST"), getSummary);
router.get("/inventory", authenticate, authorize("ADMIN", "PHARMACIST"), getInventory);
router.get("/expiry", authenticate, authorize("ADMIN", "PHARMACIST"), getExpiry);
router.get("/suppliers", authenticate, authorize("ADMIN", "PHARMACIST"), getSuppliers);
router.get("/stock-movements", authenticate, authorize("ADMIN", "PHARMACIST"), getMovements);
export default router;
