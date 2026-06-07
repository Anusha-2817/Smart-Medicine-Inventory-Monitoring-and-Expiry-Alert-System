import { Router } from "express";
import { list, get, create, updateStatus, remove } from "./order.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/:id", authenticate, get);
router.post("/", authenticate, create);
router.put("/:id/status", authenticate, updateStatus);
router.delete("/:id", authenticate, remove);
export default router;
