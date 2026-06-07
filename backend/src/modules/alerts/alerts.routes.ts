import { Router } from "express";

import {
  getAll,
  resolve,
  generateLowStock,
  generateExpiry,
} from "./alerts.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, getAll);

router.patch(
  "/:id/resolve",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  resolve,
);

router.post(
  "/generate-low-stock",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  generateLowStock,
);

router.post(
  "/generate-expiry",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  generateExpiry,
);

export default router;
