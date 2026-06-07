import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";

import { upload } from "./upload.middleware";

import { importMedicines } from "./import.controller";

const router = Router();

router.post("/medicines", authenticate, upload.single("file"), importMedicines);

export default router;
