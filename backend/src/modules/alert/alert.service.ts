import { prisma } from "../../config/prisma";

export const getAlerts = async (params: { resolved?: string; severity?: string; search?: string; page?: number; limit?: number }) => {
  const { resolved, severity, search, page = 1, limit = 20 } = params;
  const where: any = {};
  
  if (resolved !== undefined) where.isResolved = resolved === "true";
  if (severity) where.severity = severity;
  
  if (search) {
    where.OR = [
      { batch: { batchNumber: { contains: search, mode: "insensitive" } } },
      { batch: { medicine: { name: { contains: search, mode: "insensitive" } } } }
    ];
  }

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

export const getAlertSummary = async () => {
  const [unresolved, critical, warning, resolved] = await Promise.all([
    prisma.alert.count({ where: { isResolved: false } }),
    prisma.alert.count({ where: { isResolved: false, severity: "CRITICAL" } }),
    prisma.alert.count({ where: { isResolved: false, severity: "WARNING" } }),
    prisma.alert.count({ where: { isResolved: true } }),
  ]);

  return {
    unresolved,
    critical,
    warning,
    resolved
  };
};

export const resolveAlert = async (id: string) =>
  prisma.alert.update({ where: { id }, data: { isResolved: true, resolvedAt: new Date() } });

export const bulkResolveAlerts = async (ids: string[]) => {
  const result = await prisma.alert.updateMany({
    where: { id: { in: ids }, isResolved: false },
    data: { isResolved: true, resolvedAt: new Date() }
  });
  return { count: result.count };
};
