import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./suppliers.controller";

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
  "/",
  authenticate,
  authorize("ADMIN"),
  create
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  remove
);

export default router;