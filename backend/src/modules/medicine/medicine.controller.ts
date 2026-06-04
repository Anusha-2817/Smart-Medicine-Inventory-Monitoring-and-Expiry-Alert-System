import { Request, Response } from "express";

import {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} from "./medicine.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const medicine = await createMedicine(req.body);

    res.status(201).json({
      success: true,
      medicine,
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
    const medicines = await getAllMedicines();

    res.status(200).json({
      success: true,
      medicines,
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

    const medicine = await getMedicineById(id);

    res.status(200).json({
      success: true,
      medicine,
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
  try { // console.log("UPDATE BODY:", req.body);
    const id = req.params.id as string;

    const medicine = await updateMedicine(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      medicine,
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
  console.log("UPDATE BODY:", req.body);
  try {
    const id = req.params.id as string;
    console.log("UPDATE ID:", req.params.id);
    console.log("UPDATE BODY:", req.body); 

    await deleteMedicine(id);

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};