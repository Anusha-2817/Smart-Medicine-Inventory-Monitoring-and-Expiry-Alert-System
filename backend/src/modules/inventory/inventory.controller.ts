import { Request, Response } from "express";
import * as svc from "./inventory.service";

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getInventory({
      search: req.query.search as string,
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await svc.createBatch(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await svc.updateBatch(req.params["id"] as string, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const expiring = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const data = await svc.getExpiringBatches(days);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
