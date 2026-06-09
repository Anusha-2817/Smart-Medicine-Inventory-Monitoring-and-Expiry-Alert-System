import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { parseFile, cleanupFile } from "./import-parser";
import {
  validateMedicineRows,
  validateInventoryRows,
  validateSupplierRows,
} from "./import-validators";

// ============================================================
// EXPORT HANDLERS
// ============================================================

export const exportCSV = async (_req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({ orderBy: { name: "asc" } });
    const headers = ["id", "name", "genericName", "category", "manufacturer", "sku", "status", "reorderThreshold"];
    const rows = medicines.map((m) =>
      headers.map((h) => (m as any)[h] ?? "").join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=medicines.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportInventoryCSV = async (_req: Request, res: Response) => {
  try {
    const batches = await prisma.inventoryBatch.findMany({
      include: { medicine: { select: { name: true, sku: true } }, supplier: { select: { name: true } } },
      orderBy: { expiryDate: "asc" },
    });
    const headers = ["batchNumber", "medicineName", "supplierName", "quantity", "unitCost", "expiryDate", "status"];
    const rows = batches.map((b) => [
      b.batchNumber, b.medicine.name, b.supplier.name, b.quantity, b.unitCost.toString(), b.expiryDate.toISOString().split("T")[0], b.status
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// TEMPLATE DOWNLOADS
// ============================================================

export const downloadMedicinesTemplate = (_req: Request, res: Response) => {
  const csv = "Name,Generic Name,Category,Manufacturer,SKU,Prescription Required,Reorder Threshold\nParacetamol 500mg,Paracetamol,Analgesic,PharmaCo,MED-001,No,100\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=medicines_template.csv");
  res.send(csv);
};

export const downloadInventoryTemplate = (_req: Request, res: Response) => {
  const csv = "Medicine SKU,Batch Number,Quantity,Unit Cost,Supplier,Manufacture Date,Expiry Date\nMED-001,BATCH-2024-001,500,12.50,MedSupply Co,2024-01-01,2026-12-31\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=inventory_template.csv");
  res.send(csv);
};

export const downloadSuppliersTemplate = (_req: Request, res: Response) => {
  const csv = "Supplier Name,Contact Person,Phone,Email,Address\nMedSupply Co,John Smith,+1-555-0100,john@medsupply.com,123 Pharma St\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=suppliers_template.csv");
  res.send(csv);
};

// ============================================================
// IMPORT HANDLERS
// ============================================================

export const importMedicines = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const { rows } = parseFile(file.path);

    // Fetch existing SKUs to check for duplicates
    const existingMeds = await prisma.medicine.findMany({ select: { sku: true } });
    const existingSkus = new Set(existingMeds.map((m) => m.sku));

    const { valid, errors } = validateMedicineRows(rows, existingSkus);

    // Bulk create valid medicines
    let successCount = 0;
    if (valid.length > 0) {
      const result = await prisma.medicine.createMany({
        data: valid.map((r) => ({
          name: r.Name,
          genericName: r["Generic Name"] || null,
          category: r.Category || null,
          manufacturer: r.Manufacturer || null,
          sku: r.SKU,
          requiresPrescription: ["yes", "true", "1"].includes(
            (r["Prescription Required"] || "").toLowerCase()
          ),
          reorderThreshold: r["Reorder Threshold"]
            ? Math.max(0, parseInt(r["Reorder Threshold"], 10) || 50)
            : 50,
        })),
        skipDuplicates: true,
      });
      successCount = result.count;
    }

    const userId = (req as any).user?.userId;
    if (userId) {
      await prisma.importHistory.create({
        data: {
          importType: "MEDICINES",
          fileName: file.originalname,
          uploadedBy: userId,
          uploadedCount: rows.length,
          successCount,
          failedCount: errors.length,
          errors: errors as any,
        },
      });
    }

    return res.json({
      success: true,
      uploaded: rows.length,
      imported: successCount,
      failed: errors.length,
      errors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    cleanupFile(file.path);
  }
};

export const importInventory = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const { rows } = parseFile(file.path);

    // Build lookup maps
    const [medicines, suppliers, existingBatches] = await Promise.all([
      prisma.medicine.findMany({ select: { id: true, sku: true } }),
      prisma.supplier.findMany({ select: { id: true, name: true } }),
      prisma.inventoryBatch.findMany({ select: { medicineId: true, batchNumber: true } }),
    ]);

    const medicineSkuToId = new Map(medicines.map((m) => [m.sku, m.id]));
    const supplierNameToId = new Map(
      suppliers.map((s) => [s.name.toLowerCase(), s.id])
    );
    const existingBatchSet = new Set(
      existingBatches.map((b) => `${b.medicineId}|${b.batchNumber}`)
    );

    const { valid, errors } = validateInventoryRows(
      rows,
      medicineSkuToId,
      supplierNameToId,
      existingBatchSet
    );

    let successCount = 0;
    if (valid.length > 0) {
      const result = await prisma.inventoryBatch.createMany({
        data: valid.map((r) => ({
          medicineId: medicineSkuToId.get(r["Medicine SKU"])!,
          supplierId: supplierNameToId.get(r["Supplier"].toLowerCase())!,
          batchNumber: r["Batch Number"],
          quantity: parseInt(r.Quantity, 10),
          unitCost: parseFloat(r["Unit Cost"]),
          manufacturingDate: r["Manufacture Date"] ? new Date(r["Manufacture Date"]) : null,
          expiryDate: new Date(r["Expiry Date"]),
        })),
        skipDuplicates: true,
      });
      successCount = result.count;
    }

    const userId = (req as any).user?.userId;
    if (userId) {
      await prisma.importHistory.create({
        data: {
          importType: "INVENTORY",
          fileName: file.originalname,
          uploadedBy: userId,
          uploadedCount: rows.length,
          successCount,
          failedCount: errors.length,
          errors: errors as any,
        },
      });
    }

    return res.json({
      success: true,
      uploaded: rows.length,
      imported: successCount,
      failed: errors.length,
      errors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    cleanupFile(file.path);
  }
};

export const importSuppliers = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const { rows } = parseFile(file.path);

    const existingSuppliers = await prisma.supplier.findMany({ select: { name: true } });
    const existingNames = new Set(existingSuppliers.map((s) => s.name.toLowerCase()));

    const { valid, errors } = validateSupplierRows(rows, existingNames);

    let successCount = 0;
    if (valid.length > 0) {
      const result = await prisma.supplier.createMany({
        data: valid.map((r) => ({
          name: r["Supplier Name"],
          contactPerson: r["Contact Person"] || null,
          phone: r.Phone || null,
          email: r.Email || null,
          address: r.Address || null,
        })),
        skipDuplicates: true,
      });
      successCount = result.count;
    }

    const userId = (req as any).user?.userId;
    if (userId) {
      await prisma.importHistory.create({
        data: {
          importType: "SUPPLIERS",
          fileName: file.originalname,
          uploadedBy: userId,
          uploadedCount: rows.length,
          successCount,
          failedCount: errors.length,
          errors: errors as any,
        },
      });
    }

    return res.json({
      success: true,
      uploaded: rows.length,
      imported: successCount,
      failed: errors.length,
      errors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    cleanupFile(file.path);
  }
};
