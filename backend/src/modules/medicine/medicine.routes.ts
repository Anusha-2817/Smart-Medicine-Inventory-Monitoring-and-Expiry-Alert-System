import { Router } from "express";
import { list, get, create, update, remove } from "./medicine.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/:id", authenticate, get);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);
export default router;
