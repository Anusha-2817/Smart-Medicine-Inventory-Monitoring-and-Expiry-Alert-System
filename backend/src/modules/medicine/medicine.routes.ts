import { Router } from "express";
import { list, get, create, update, remove } from "./medicine.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/:id", authenticate, get);
router.post("/", authenticate, authorize("ADMIN", "PHARMACIST"), create);
router.put("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), update);
router.delete("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), remove);
export default router;
