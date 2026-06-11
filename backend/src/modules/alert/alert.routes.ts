import { Router } from "express";
import { list, resolve, getSummary, bulkResolve } from "./alert.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/summary", authenticate, getSummary);
router.get("/", authenticate, list);
router.put("/bulk-resolve", authenticate, authorize("ADMIN", "PHARMACIST"), bulkResolve);
router.put("/:id/resolve", authenticate, authorize("ADMIN", "PHARMACIST"), resolve);
export default router;
