import { Request, Response } from "express";

import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
} from "./purchase-order.service";

export const create = async (req: Request, res: Response) => {
//   console.log("USER:", (req as any).user);
  try {
    const userId = (req as any).user.userId; //error aqui, userId não existe no token, tem que ser user.id

    const order = await createPurchaseOrder(
      req.body.supplierId,
      userId,
      req.body.items,
    );

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const orders = await getAllPurchaseOrders();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const order = await getPurchaseOrderById(req.params.id as string);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const order = await updatePurchaseOrderStatus(
  req.params.id as string,
  req.body.status,
  req.body.batches
);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
