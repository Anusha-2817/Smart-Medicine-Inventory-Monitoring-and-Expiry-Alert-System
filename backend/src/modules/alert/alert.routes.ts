import { Router } from "express";
import { list, resolve, getSummary, bulkResolve } from "./alert.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/summary", authenticate, getSummary);
router.get("/", authenticate, list);
router.put("/bulk-resolve", authenticate, bulkResolve);
router.put("/:id/resolve", authenticate, resolve);
export default router;
