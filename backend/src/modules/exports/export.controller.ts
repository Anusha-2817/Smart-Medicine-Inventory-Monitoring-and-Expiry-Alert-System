import { Request, Response } from "express";

import {
  exportMedicinesCSV,
  exportMedicinesExcel as exportMedicinesExcelService,
} from "./export.service";

export const medicinesCSV = async (req: Request, res: Response) => {
  try {
    const csv = await exportMedicinesCSV();

    res.header("Content-Type", "text/csv");

    res.attachment("medicines.csv");

    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const medicinesExcel = async (req: Request, res: Response) => {
  try {
    const file = await exportMedicinesExcelService();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="medicines.xlsx"',
    );

    return res.send(file);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
