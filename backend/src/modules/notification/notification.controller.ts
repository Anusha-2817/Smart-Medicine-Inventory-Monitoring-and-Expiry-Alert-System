import { Request, Response } from "express";
import * as svc from "./notification.service";

const getUserId = (req: Request) => (req as any).user.userId as string;

export const list = async (req: Request, res: Response) => {
  try {
    const result = await svc.getNotifications(getUserId(req), {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unreadCount = async (req: Request, res: Response) => {
  try {
    const count = await svc.getUnreadCount(getUserId(req));
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const data = await svc.markAsRead(req.params["id"] as string, getUserId(req));
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    await svc.markAllAsRead(getUserId(req));
    res.json({ success: true, message: "All marked as read" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
