import { Router } from "express";
import { searchGlobal } from "./search.controller";

const router = Router();

router.get("/", searchGlobal);

export default router;
