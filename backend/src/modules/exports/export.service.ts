import { prisma } from "../../config/prisma";
import { Parser } from "json2csv";
import * as XLSX from "xlsx";

export const exportMedicinesCSV = async () => {
  const medicines = await prisma.medicine.findMany();

  const exportData = medicines.map((medicine) => ({
    "Medicine Name": medicine.name,

    "Generic Name": medicine.genericName ?? "",

    Category: medicine.category ?? "",

    Manufacturer: medicine.manufacturer ?? "",

    SKU: medicine.sku,

    "Prescription Required": medicine.requiresPrescription ? "Yes" : "No",

    "Reorder Threshold": medicine.reorderThreshold,

    Status: medicine.status,
  }));

  const parser = new Parser();

  return parser.parse(exportData);
};

export const exportMedicinesExcel = async () => {
  const medicines = await prisma.medicine.findMany();

  const exportData = medicines.map((medicine) => ({
    "Medicine Name": medicine.name,
    "Generic Name": medicine.genericName ?? "",
    Category: medicine.category ?? "",
    Manufacturer: medicine.manufacturer ?? "",
    SKU: medicine.sku,
    "Prescription Required": medicine.requiresPrescription ? "Yes" : "No",
    "Reorder Threshold": medicine.reorderThreshold,
    Status: medicine.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

  const result = XLSX.write(workbook, {
    type: "binary",
    bookType: "xlsx",
  });

  return Buffer.from(result, "binary");
};
