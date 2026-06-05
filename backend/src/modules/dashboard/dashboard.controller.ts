import { Request, Response } from "express";

import {
  getSummary,
  getAlertStats,
  getInventoryStats,
} from "./dashboard.service";

export const summary = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getSummary();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const alerts = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAlertStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const inventory = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await getInventoryStats();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};