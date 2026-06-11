import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { upload } from "./import.middleware";
import {
  exportCSV,
  exportInventoryCSV,
  downloadMedicinesTemplate,
  downloadInventoryTemplate,
  downloadSuppliersTemplate,
  importMedicines,
  importInventory,
  importSuppliers,
} from "./import-export.controller";
import { getImportHistory } from "./import-history.controller";

const router = Router();

// ---- Export ----
router.get("/export/medicines", authenticate, authorize("ADMIN"), exportCSV);
router.get("/export/inventory", authenticate, authorize("ADMIN"), exportInventoryCSV);

// ---- Templates ----
router.get("/export/medicines-template", authenticate, authorize("ADMIN"), downloadMedicinesTemplate);
router.get("/export/inventory-template", authenticate, authorize("ADMIN"), downloadInventoryTemplate);
router.get("/export/suppliers-template", authenticate, authorize("ADMIN"), downloadSuppliersTemplate);

// ---- Import ----
router.post("/import/medicines", authenticate, authorize("ADMIN"), upload.single("file"), importMedicines);
router.post("/import/inventory", authenticate, authorize("ADMIN"), upload.single("file"), importInventory);
router.post("/import/suppliers", authenticate, authorize("ADMIN"), upload.single("file"), importSuppliers);

// ---- History ----
router.get("/import/history", authenticate, authorize("ADMIN"), getImportHistory);

export default router;
