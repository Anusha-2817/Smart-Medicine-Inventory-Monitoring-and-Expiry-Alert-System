import { Request, Response } from "express";
import * as svc from "./supplier.service";

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getSuppliers({ search: req.query.search as string, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    res.json({ success: true, ...result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};
export const get = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await svc.getSupplier(req.params["id"] as string) }); }
  catch (err: any) { res.status(404).json({ success: false, message: err.message }); }
};
export const create = async (req: Request, res: Response) => {
  try { res.status(201).json({ success: true, data: await svc.createSupplier(req.body) }); }
  catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
export const update = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await svc.updateSupplier(req.params["id"] as string, req.body) }); }
  catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
export const remove = async (req: Request, res: Response) => {
  try { await svc.deleteSupplier(req.params["id"] as string); res.json({ success: true, message: "Deleted" }); }
  catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
