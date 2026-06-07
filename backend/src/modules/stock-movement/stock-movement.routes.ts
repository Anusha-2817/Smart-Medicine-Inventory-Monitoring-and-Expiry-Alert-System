import { Router } from "express";
import { list, create } from "./stock-movement.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.post("/", authenticate, create);
export default router;
