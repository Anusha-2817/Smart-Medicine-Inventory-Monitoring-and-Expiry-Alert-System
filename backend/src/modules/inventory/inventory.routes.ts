import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./inventory.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, getById);

router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);

router.put("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), update);

router.delete("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), remove);

export default router;
