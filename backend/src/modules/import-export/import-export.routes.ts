import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
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
router.get("/export/medicines", authenticate, exportCSV);
router.get("/export/inventory", authenticate, exportInventoryCSV);

// ---- Templates ----
router.get("/export/medicines-template", authenticate, downloadMedicinesTemplate);
router.get("/export/inventory-template", authenticate, downloadInventoryTemplate);
router.get("/export/suppliers-template", authenticate, downloadSuppliersTemplate);

// ---- Import ----
router.post("/import/medicines", authenticate, upload.single("file"), importMedicines);
router.post("/import/inventory", authenticate, upload.single("file"), importInventory);
router.post("/import/suppliers", authenticate, upload.single("file"), importSuppliers);

// ---- History ----
router.get("/import/history", authenticate, getImportHistory);

export default router;
