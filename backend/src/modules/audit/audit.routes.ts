import { Router } from "express";
import * as auditController from "./audit.controller";

const router = Router();

router.get("/summary", auditController.getSummary);
router.get("/analytics", auditController.getAnalytics);
router.get("/anomalies", auditController.getAnomalies);
router.get("/movements", auditController.getMovements);

export default router;
