import { Request, Response } from "express";

import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "./suppliers.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const supplier = await createSupplier(req.body);

    res.status(201).json({
      success: true,
      supplier,
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
    const suppliers = await getAllSuppliers();

    res.status(200).json({
      success: true,
      suppliers,
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

    const supplier = await getSupplierById(id);

    res.status(200).json({
      success: true,
      supplier,
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

    const supplier = await updateSupplier(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      supplier,
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

    await deleteSupplier(id);

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};