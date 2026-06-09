import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const getImportHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.importHistory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.importHistory.count(),
    ]);

    res.json({ success: true, data: records, total, page, limit });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
