import { Router } from "express";

import {
  create,
  getAll,
  getById,
  updateStatus,
} from "./purchase-order.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, getById);

router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  updateStatus,
);

export default router;
