import { Request, Response } from "express";
import * as svc from "./order.service";

const getUserId = (req: Request) => (req as any).user.userId as string;

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getOrders({ status: req.query.status as string, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    res.json({ success: true, ...result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};
export const get = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await svc.getOrder(req.params["id"] as string) }); }
  catch (err: any) { res.status(404).json({ success: false, message: err.message }); }
};
export const create = async (req: Request, res: Response) => {
  try {
    const data = await svc.createOrder({ ...req.body, createdBy: getUserId(req) });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const data = await svc.updateOrderStatus(req.params["id"] as string, req.body.status);
    res.json({ success: true, data });
  } catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
export const remove = async (req: Request, res: Response) => {
  try { await svc.deleteOrder(req.params["id"] as string); res.json({ success: true, message: "Deleted" }); }
  catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
