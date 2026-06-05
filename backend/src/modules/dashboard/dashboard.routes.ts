import { Router } from "express";

import {
  summary,
  alerts,
  inventory,
} from "./dashboard.controller";

import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/summary",
  authenticate,
  summary
);

router.get(
  "/alerts",
  authenticate,
  alerts
);

router.get(
  "/inventory",
  authenticate,
  inventory
);

export default router;