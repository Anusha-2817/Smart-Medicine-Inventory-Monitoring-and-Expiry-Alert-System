import { Request, Response } from "express";

import {
  createInventoryBatch,
  getAllInventoryBatches,
  getInventoryBatchById,
  updateInventoryBatch,
  deleteInventoryBatch,
} from "./inventory.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {

    const batch =
      await createInventoryBatch(req.body);

    res.status(201).json({
      success: true,
      batch,
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

    const batches =
      await getAllInventoryBatches();

    res.status(200).json({
      success: true,
      batches,
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

    const id = req.params.id as string;

    const batch =
      await getInventoryBatchById(id);

    res.status(200).json({
      success: true,
      batch,
    });

  } catch (error: any) {

    res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};

export const update = async (
  req: Request,
  res: Response
) => {
  try {

    const id = req.params.id as string;

    const batch =
      await updateInventoryBatch(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      batch,
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const remove = async (
  req: Request,
  res: Response
) => {
  try {

    const id = req.params.id as string;

    await deleteInventoryBatch(id);

    res.status(200).json({
      success: true,
      message:
        "Inventory batch deleted successfully",
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};