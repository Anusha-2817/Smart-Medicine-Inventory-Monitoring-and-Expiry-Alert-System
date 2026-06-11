import { prisma } from "../../config/prisma";
import { Prisma, MovementType } from "@prisma/client";

export const getAuditSummary = async (startDate?: Date, endDate?: Date) => {
  const dateFilter: Prisma.StockMovementWhereInput = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { gte: startDate, lte: endDate };
  }

  const movements = await prisma.stockMovement.groupBy({
    by: ["movementType"],
    where: dateFilter,
    _count: { id: true },
  });

  const totalMovements = movements.reduce((acc, curr) => acc + curr._count.id, 0);
  
  const getCount = (type: string) => movements.find((m) => m.movementType === type)?._count.id || 0;

  return {
    totalMovements,
    stockIn: getCount("STOCK_IN"),
    stockOut: getCount("STOCK_OUT"),
    adjustments: getCount("ADJUSTMENT"),
    returns: getCount("RETURNED"),
  };
};

export const getAuditAnalytics = async (startDate?: Date, endDate?: Date) => {
  const dateFilter: Prisma.StockMovementWhereInput = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { gte: startDate, lte: endDate };
  }

  // Most active user
  const userActivity = await prisma.stockMovement.groupBy({
    by: ["userId"],
    where: dateFilter,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  let mostActiveUser = null;
  if (userActivity.length > 0) {
    const user = await prisma.user.findUnique({ where: { id: userActivity[0].userId } });
    if (user) {
      mostActiveUser = {
        name: user.name,
        movements: userActivity[0]._count.id,
      };
    }
  }

  // Most moved medicine
  const movements = await prisma.stockMovement.findMany({
    where: dateFilter,
    include: { batch: { include: { medicine: true } } },
  });

  const medicineCounts: Record<string, { name: string; count: number }> = {};
  movements.forEach((m) => {
    const medId = m.batch.medicine.id;
    if (!medicineCounts[medId]) {
      medicineCounts[medId] = { name: m.batch.medicine.name, count: 0 };
    }
    medicineCounts[medId].count++;
  });

  let mostMovedMedicine = null;
  let highestCount = 0;
  Object.values(medicineCounts).forEach((m) => {
    if (m.count > highestCount) {
      highestCount = m.count;
      mostMovedMedicine = { name: m.name, count: m.count };
    }
  });

  // Top supplier
  const supplierCounts: Record<string, { name: string; count: number }> = {};
  const supplierMovements = await prisma.stockMovement.findMany({
    where: { ...dateFilter, movementType: "STOCK_IN" },
    include: { batch: { include: { supplier: true } } },
  });

  supplierMovements.forEach((m) => {
    const supId = m.batch.supplier.id;
    if (!supplierCounts[supId]) {
      supplierCounts[supId] = { name: m.batch.supplier.name, count: 0 };
    }
    supplierCounts[supId].count++;
  });

  let topSupplier = null;
  let highestSupCount = 0;
  const totalStockIn = supplierMovements.length || 1;
  Object.values(supplierCounts).forEach((s) => {
    if (s.count > highestSupCount) {
      highestSupCount = s.count;
      topSupplier = { 
        name: s.name, 
        percentage: Math.round((s.count / totalStockIn) * 100)
      };
    }
  });

  // Movement trend (last 30 days or based on filter)
  // To keep it simple, we'll aggregate by day using the fetched movements
  const trendMap: Record<string, number> = {};
  movements.forEach((m) => {
    const dateStr = m.createdAt.toISOString().split("T")[0];
    trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
  });

  const movementTrend = Object.entries(trendMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-14) // Last 14 days of data to prevent chart overload
    .map(([date, count]) => ({ date, count }));

  return {
    mostActiveUser,
    mostMovedMedicine,
    topSupplier,
    movementTrend,
  };
};

export const getAuditAnomalies = async () => {
  // Anomalies logic
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const anomalies: Array<{ id: string, title: string, details: string, severity: string, date: Date }> = [];

  // 1. Large Stock Removal
  const largeRemovals = await prisma.stockMovement.findMany({
    where: {
      movementType: "STOCK_OUT",
      quantity: { gte: 100 },
      createdAt: { gte: thirtyDaysAgo },
    },
    include: { batch: { include: { medicine: true } }, user: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  largeRemovals.forEach((r) => {
    anomalies.push({
      id: `removal-${r.id}`,
      title: "Large Stock Removal",
      details: `${r.quantity} units of ${r.batch.medicine.name} removed by ${r.user.name}`,
      severity: "Review Required",
      date: r.createdAt,
    });
  });

  // 2. Frequent Adjustments (simplified: large single adjustment)
  const largeAdjustments = await prisma.stockMovement.findMany({
    where: {
      movementType: "ADJUSTMENT",
      quantity: { gte: 50 },
      createdAt: { gte: thirtyDaysAgo },
    },
    include: { batch: { include: { medicine: true } }, user: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  largeAdjustments.forEach((r) => {
    anomalies.push({
      id: `adj-${r.id}`,
      title: "Large Adjustment",
      details: `Adjustment of ${r.quantity} units for ${r.batch.medicine.name} by ${r.user.name}`,
      severity: "Investigate",
      date: r.createdAt,
    });
  });

  return anomalies;
};

export const getAuditMovements = async (filters: any) => {
  const { startDate, endDate, type, userId, search, page = 1, limit = 50 } = filters;

  const where: Prisma.StockMovementWhereInput = {};

  if (startDate && endDate) {
    where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
  }
  if (type && type !== "All") {
    // map type to enum if needed, assume frontend sends exactly the enum e.g. "STOCK_IN"
    where.movementType = type as MovementType;
  }
  if (userId && userId !== "All Users") {
    // If it's a role
    if (["Admin", "Pharmacist", "Store Manager"].includes(userId)) {
        where.user = { role: userId.toUpperCase() as any };
    } else {
        where.userId = userId;
    }
  }
  if (search) {
    where.batch = {
      medicine: {
        name: { contains: search, mode: "insensitive" },
      },
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [total, data] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, role: true } },
        batch: {
          include: {
            medicine: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data,
  };
};
