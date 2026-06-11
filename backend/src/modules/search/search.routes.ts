import { Router } from "express";
import { searchGlobal } from "./search.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, searchGlobal);

export default router;
