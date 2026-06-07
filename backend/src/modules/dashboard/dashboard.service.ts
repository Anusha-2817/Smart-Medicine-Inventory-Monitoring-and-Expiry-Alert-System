import { prisma } from "../../config/prisma";

export const getDashboardStats = async () => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalMedicines,
    totalBatches,
    totalSuppliers,
    lowStockMedicines,
    expiringBatches,
    expiredBatches,
    stockDistribution,
    recentMovements,
    supplierContribution,
  ] = await Promise.all([
    prisma.medicine.count({ where: { status: "ACTIVE" } }),
    prisma.inventoryBatch.count({ where: { status: "ACTIVE" } }),
    prisma.supplier.count(),
    prisma.medicine.count({
      where: {
        status: "ACTIVE",
        inventoryBatches: {
          some: {
            status: "ACTIVE",
            quantity: { gt: 0 },
            medicine: { reorderThreshold: { gt: 0 } },
          },
        },
      },
    }),
    prisma.inventoryBatch.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gte: now, lte: in30Days },
      },
    }),
    prisma.inventoryBatch.count({ where: { status: "EXPIRED" } }),
    prisma.inventoryBatch.groupBy({
      by: ["medicineId"],
      where: { status: "ACTIVE" },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
    prisma.stockMovement.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        batch: { include: { medicine: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.inventoryBatch.groupBy({
      by: ["supplierId"],
      where: { status: "ACTIVE" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  // Resolve medicine names for stock distribution
  const medicineIds = stockDistribution.map((s) => s.medicineId);
  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: { id: true, name: true },
  });
  const medMap = Object.fromEntries(medicines.map((m) => [m.id, m.name]));

  const stockDist = stockDistribution.map((s) => ({
    name: medMap[s.medicineId] ?? "Unknown",
    qty: s._sum.quantity ?? 0,
  }));

  // Resolve supplier names
  const supplierIds = supplierContribution.map((s) => s.supplierId);
  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true },
  });
  const supMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
  const total = supplierContribution.reduce((a, s) => a + s._count.id, 0) || 1;
  const supContrib = supplierContribution.map((s) => ({
    name: supMap[s.supplierId] ?? "Unknown",
    value: Math.round((s._count.id / total) * 100),
  }));

  // Build expiry trend (next 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { month: d.toLocaleString("default", { month: "short" }), start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0) };
  });
  const expiryTrend = await Promise.all(
    months.map(async ({ month, start, end }) => ({
      month,
      count: await prisma.inventoryBatch.count({ where: { expiryDate: { gte: start, lte: end } } }),
    }))
  );

  // Recent activity
  const activity = recentMovements.map((m) => ({
    type: m.movementType,
    text: `${m.movementType === "STOCK_IN" ? "+" : "-"}${m.quantity} ${m.batch.medicine.name}`,
    who: m.user.name,
    time: m.createdAt.toISOString(),
  }));

  return {
    kpis: {
      totalMedicines,
      totalBatches,
      totalSuppliers,
      lowStockMedicines,
      expiringIn30Days: expiringBatches,
      expired: expiredBatches,
    },
    stockDistribution: stockDist,
    expiryTrend,
    supplierContribution: supContrib,
    recentActivity: activity,
  };
};
