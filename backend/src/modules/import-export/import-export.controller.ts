import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

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
