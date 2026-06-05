import { Request, Response } from "express";

import {
  getAllAlerts,
  resolveAlert,
  generateLowStockAlerts,
  generateExpiryAlerts,
} from "./alerts.service";

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const alerts =
      await getAllAlerts();

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolve = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const alert =
      await resolveAlert(id);

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateLowStock =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await generateLowStockAlerts();

      res.status(200).json({
        success: true,
        message:
          "Low stock alerts generated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const generateExpiry =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await generateExpiryAlerts();

      res.status(200).json({
        success: true,
        message:
          "Expiry alerts generated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };