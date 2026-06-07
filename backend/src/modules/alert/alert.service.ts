import { prisma } from "../../config/prisma";

export const getAlerts = async (params: { resolved?: string; severity?: string; page?: number; limit?: number }) => {
  const { resolved, severity, page = 1, limit = 20 } = params;
  const where: any = {};
  if (resolved !== undefined) where.isResolved = resolved === "true";
  if (severity) where.severity = severity;
  const [data, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { batch: { include: { medicine: { select: { name: true, sku: true } } } } },
    }),
    prisma.alert.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const resolveAlert = async (id: string) =>
  prisma.alert.update({ where: { id }, data: { isResolved: true, resolvedAt: new Date() } });
