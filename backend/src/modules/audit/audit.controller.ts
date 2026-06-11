import { Request, Response } from "express";
import * as auditService from "./audit.service";

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await auditService.getAuditSummary(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await auditService.getAuditAnalytics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnomalies = async (req: Request, res: Response) => {
  try {
    const data = await auditService.getAuditAnomalies();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovements = async (req: Request, res: Response) => {
  try {
    const data = await auditService.getAuditMovements(req.query);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
