import { Router } from "express";

import {
  stockIn,
  stockOut,
  adjustment,
  getAll,
  getById,
} from "./stock-movement.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getAll
);

router.get(
  "/:id",
  authenticate,
  getById
);

router.post(
  "/stock-in",
  authenticate,
  authorize(
    "ADMIN",
    "PHARMACIST"
  ),
  stockIn
);

router.post(
  "/stock-out",
  authenticate,
  authorize(
    "ADMIN",
    "PHARMACIST"
  ),
  stockOut
);

router.post(
  "/adjustment",
  authenticate,
  authorize(
    "ADMIN",
    "PHARMACIST"
  ),
  adjustment
);

export default router;