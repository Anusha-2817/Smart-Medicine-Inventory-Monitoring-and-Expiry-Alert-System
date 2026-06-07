import { Router } from "express";

import { getAll, read, readAll } from "./notification.controller";

import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getAll);

router.patch("/:id/read", authenticate, read);

router.patch("/read-all", authenticate, readAll);

export default router;
