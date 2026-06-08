import { Request, Response } from "express";
import * as svc from "./medicine.service";

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getMedicines({
      search: req.query.search as string,
      category: req.query.category as string,
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const data = await svc.getMedicine(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await svc.createMedicine(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await svc.updateMedicine(req.params["id"] as string, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await svc.deleteMedicine(req.params["id"] as string);
    res.json({ success: true, message: "Deleted" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
