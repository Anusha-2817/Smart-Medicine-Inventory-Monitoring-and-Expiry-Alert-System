import { Router } from "express";
import { list, create } from "./stock-movement.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/", authenticate, list);
router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);
export default router;
