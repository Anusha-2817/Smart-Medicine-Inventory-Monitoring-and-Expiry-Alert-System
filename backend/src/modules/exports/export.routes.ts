import { Router } from "express";

import { medicinesCSV, medicinesExcel } from "./export.controller";

import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/medicines/csv", authenticate, medicinesCSV);

router.get("/medicines/excel", authenticate, medicinesExcel);

export default router;
