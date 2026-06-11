import { Router } from "express";
import { list, create, update, expiring } from "./inventory.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/expiring", authenticate, expiring);
router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);
router.put("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), update);
export default router;
