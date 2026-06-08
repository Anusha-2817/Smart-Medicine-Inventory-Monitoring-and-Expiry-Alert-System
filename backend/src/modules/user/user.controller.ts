import { Request, Response } from "express";
import * as svc from "./user.service";

export const list = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string;
    const result = await svc.getUsers({ search, page, limit });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await svc.createUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await svc.updateUser(req.params["id"] as string, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await svc.deleteUser(req.params["id"] as string);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
