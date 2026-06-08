import { Request, Response } from "express";
import * as svc from "./alert.service";

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getAlerts({
      resolved: req.query.resolved as string,
      severity: req.query.severity as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const resolve = async (req: Request, res: Response) => {
  try {
    const data = await svc.resolveAlert(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err: any) { res.status(400).json({ success: false, message: err.message }); }
};
