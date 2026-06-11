import { Router } from "express";
import { status, generate, generateSync } from "./demo.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

/** GET /api/demo/status — current record counts */
router.get("/status", authenticate, authorize("ADMIN"), status);

/** POST /api/demo/generate — async (returns immediately, generates in background) */
router.post("/generate", authenticate, authorize("ADMIN"), generate);

/** POST /api/demo/generate-sync — synchronous (waits for completion, returns summary) */
router.post("/generate-sync", authenticate, authorize("ADMIN"), generateSync);

export default router;
