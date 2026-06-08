import { Request, Response } from "express";
import * as svc from "./report.service";

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getInventoryReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExpiry = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getExpiryReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getSupplierReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMovements = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getMovementsReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getFullReportSummary();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
