import { Router } from "express";
import { list, create, update, expiring } from "./inventory.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/expiring", authenticate, expiring);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
export default router;
