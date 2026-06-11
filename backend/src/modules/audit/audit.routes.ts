import { Router } from "express";
import * as auditController from "./audit.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/summary", authenticate, authorize("ADMIN"), auditController.getSummary);
router.get("/analytics", authenticate, authorize("ADMIN"), auditController.getAnalytics);
router.get("/anomalies", authenticate, authorize("ADMIN"), auditController.getAnomalies);
router.get("/movements", authenticate, authorize("ADMIN"), auditController.getMovements);

export default router;
