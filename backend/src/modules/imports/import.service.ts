import * as XLSX from "xlsx";

import { prisma } from "../../config/prisma";
import { Buffer } from "buffer";
export const importMedicinesFromFile = async (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any>(worksheet);

  let imported = 0;

  let failed = 0;

  const failedRows = [];

  for (const row of rows) {
    try {
      await prisma.medicine.upsert({
        where: {
          sku: row["SKU"],
        },
        update: {
          name: row["Medicine Name"],
          genericName: row["Generic Name"] || null,
          category: row["Category"] || null,
          manufacturer: row["Manufacturer"] || null,
          requiresPrescription: row["Prescription Required"] === "Yes",
          reorderThreshold: Number(row["Reorder Threshold"] || 50),
          status: row["Status"] || "ACTIVE",
        },
        create: {
          name: row["Medicine Name"],
          genericName: row["Generic Name"] || null,
          category: row["Category"] || null,
          manufacturer: row["Manufacturer"] || null,
          sku: row["SKU"],
          requiresPrescription: row["Prescription Required"] === "Yes",
          reorderThreshold: Number(row["Reorder Threshold"] || 50),
          status: row["Status"] || "ACTIVE",
        },
      });

      imported++;
    } catch (error: any) {
      failed++;

      failedRows.push({
        medicine: row["Medicine Name"] || "Unknown",

        sku: row["SKU"] || "Unknown",

        reason: error?.message || "Failed to import medicine",
      });
    }
  }

  return {
    imported,
    failed,
    total: rows.length,
    failedRows,
  };
};
