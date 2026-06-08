import { Router } from "express";
import { list, resolve } from "./alert.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.put("/:id/resolve", authenticate, resolve);
export default router;
