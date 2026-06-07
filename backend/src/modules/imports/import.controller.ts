import { Request, Response } from "express";

import { importMedicinesFromFile } from "./import.service";

export const importMedicines = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const result = await importMedicinesFromFile(req.file.buffer);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
