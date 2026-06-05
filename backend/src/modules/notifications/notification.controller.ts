import { Request, Response } from "express";

import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.service";

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      (req as any).user.id;

    const notifications =
      await getAllNotifications(
        userId
      );

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const read = async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      req.params.id as string;

    const notification =
      await markAsRead(id);

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const readAll = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      (req as any).user.id;

    await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};