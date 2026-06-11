import { Router } from "express";
import { list, get, create, updateStatus, remove } from "./order.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/", authenticate, authorize("ADMIN", "PHARMACIST"), list);
router.get("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), get);
router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);
router.put("/:id/status", authenticate, authorize("ADMIN", "PHARMACIST"), updateStatus);
router.delete("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), remove);
export default router;
