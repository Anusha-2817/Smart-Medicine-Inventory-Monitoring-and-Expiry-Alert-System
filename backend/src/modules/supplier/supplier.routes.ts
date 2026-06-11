import { Router } from "express";
import { list, get, create, update, remove } from "./supplier.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
router.get("/", authenticate, authorize("ADMIN", "PHARMACIST"), list);
router.get("/:id", authenticate, authorize("ADMIN", "PHARMACIST"), get);
router.post("/", authenticate, authorize("ADMIN"), create);
router.put("/:id", authenticate, authorize("ADMIN"), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);
export default router;
