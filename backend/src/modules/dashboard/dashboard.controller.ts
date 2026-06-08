import { Request, Response } from "express";
import { getDashboardStats } from "./dashboard.service";

export const stats = async (_req: Request, res: Response) => {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
