import { Router } from "express";
import { stats } from "./dashboard.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/stats", authenticate, stats);
export default router;
