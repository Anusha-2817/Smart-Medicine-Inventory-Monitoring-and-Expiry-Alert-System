import { Request, Response } from "express";

import {
  recordStockIn,
  recordStockOut,
  recordAdjustment,
  getAllStockMovements,
  getStockMovementById,
} from "./stock-movement.service";

export const stockIn = async (
  req: Request,
  res: Response
) => {
  try {

    const userId =
      (req as any).user.userId;

    const result =
      await recordStockIn(
        userId,
        req.body
      );

    res.status(201).json({
      success: true,
      ...result,
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const stockOut = async (
  req: Request,
  res: Response
) => {
  try {

    const userId =
      (req as any).user.userId;

    const result =
      await recordStockOut(
        userId,
        req.body
      );

    res.status(201).json({
      success: true,
      ...result,
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const adjustment = async (
  req: Request,
  res: Response
) => {
  try {

    const userId =
      (req as any).user.userId;

    const result =
      await recordAdjustment(
        userId,
        req.body
      );

    res.status(201).json({
      success: true,
      ...result,
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {

    const movements =
      await getAllStockMovements();

    res.status(200).json({
      success: true,
      movements,
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getById = async (
  req: Request,
  res: Response
) => {
  try {

    const movement =
      await getStockMovementById(
        req.params.id as string
      );

    res.status(200).json({
      success: true,
      movement,
    });

  } catch (error: any) {

    res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};