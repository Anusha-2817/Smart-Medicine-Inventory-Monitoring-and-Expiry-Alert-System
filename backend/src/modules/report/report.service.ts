import { prisma } from "../../config/prisma";

export const getInventoryReport = async () => {
  // Category breakdown
  const categoryBreakdown = await prisma.medicine.groupBy({
    by: ["category"],
    where: { status: "ACTIVE" },
    _count: { id: true }
  });

  // Valuation and stock count
  const batches = await prisma.inventoryBatch.findMany({
    where: { status: "ACTIVE" },
    select: {
      quantity: true,
      unitCost: true,
    }
  });

  let totalStockValuation = 0;
  let totalStockQuantity = 0;
  for (const b of batches) {
    const qty = b.quantity;
    const cost = Number(b.unitCost) || 0;
    totalStockValuation += qty * cost;
    totalStockQuantity += qty;
  }

  // Medicines total and threshold
  const medicines = await prisma.medicine.findMany({
    where: { status: "ACTIVE" },
    include: {
      inventoryBatches: {
        where: { status: "ACTIVE" }
      }
    }
  });

  let lowStockCount = 0;
  for (const m of medicines) {
    const totalQty = m.inventoryBatches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalQty <= m.reorderThreshold) {
      lowStockCount++;
    }
  }

  return {
    totalSKUs: medicines.length,
    totalStockQuantity,
    totalStockValuation,
    lowStockCount,
    categoryBreakdown: categoryBreakdown.map(c => ({
      category: c.category ?? "Uncategorized",
      count: c._count.id
    }))
  };
};

export const getExpiryReport = async () => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [expired, critical, warning, safe] = await Promise.all([
    prisma.inventoryBatch.count({
      where: {
        OR: [
          { status: "EXPIRED" },
          { expiryDate: { lt: now } }
        ]
      }
    }),
    prisma.inventoryBatch.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gte: now, lte: in30Days }
      }
    }),
    prisma.inventoryBatch.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: in30Days, lte: in90Days }
      }
    }),
    prisma.inventoryBatch.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: in90Days }
      }
    })
  ]);

  return {
    expired,
    critical, // <= 30 days
    warning,  // 31 - 90 days
    safe      // > 90 days
  };
};

export const getSupplierReport = async () => {
  const suppliers = await prisma.supplier.findMany({
    include: {
      inventoryBatches: {
        where: { status: "ACTIVE" }
      },
      purchaseOrders: true
    }
  });

  return suppliers.map(s => {
    const totalSuppliedQuantity = s.inventoryBatches.reduce((sum, b) => sum + b.quantity, 0);
    const totalSuppliedValuation = s.inventoryBatches.reduce((sum, b) => sum + (b.quantity * Number(b.unitCost)), 0);
    
    return {
      supplierId: s.id,
      supplierName: s.name,
      batchesCount: s.inventoryBatches.length,
      totalQuantity: totalSuppliedQuantity,
      totalValuation: totalSuppliedValuation,
      purchaseOrdersCount: s.purchaseOrders.length
    };
  });
};

export const getMovementsReport = async () => {
  const summary = await prisma.stockMovement.groupBy({
    by: ["movementType"],
    _count: { id: true },
    _sum: { quantity: true }
  });

  return summary.map(s => ({
    movementType: s.movementType,
    count: s._count.id,
    totalQuantity: s._sum.quantity ?? 0
  }));
};
export const getFullReportSummary = async () => {
  const [inventory, expiry, suppliers, movements] = await Promise.all([
    getInventoryReport(),
    getExpiryReport(),
    getSupplierReport(),
    getMovementsReport()
  ]);
  return { inventory, expiry, suppliers, movements };
};
