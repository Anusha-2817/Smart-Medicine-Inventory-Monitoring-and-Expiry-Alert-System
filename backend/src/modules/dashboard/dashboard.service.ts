import { BatchStatus, AlertType, Severity } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const getSummary = async () => {
  const [
    totalMedicines,
    totalSuppliers,
    totalBatches,
    totalAlerts,
  ] = await Promise.all([
    prisma.medicine.count(),
    prisma.supplier.count(),
    prisma.inventoryBatch.count(),
    prisma.alert.count(),
  ]);

  return {
    totalMedicines,
    totalSuppliers,
    totalBatches,
    totalAlerts,
  };
};

export const getAlertStats = async () => {
  const [
    lowStock,
    expiry,
    critical,
  ] = await Promise.all([
    prisma.alert.count({
      where: {
        alertType: AlertType.LOW_STOCK,
        isResolved: false,
      },
    }),

    prisma.alert.count({
      where: {
        alertType: AlertType.EXPIRY,
        isResolved: false,
      },
    }),

    prisma.alert.count({
      where: {
        severity: Severity.CRITICAL,
        isResolved: false,
      },
    }),
  ]);

  return {
    lowStock,
    expiry,
    critical,
  };
};

export const getInventoryStats = async () => {
  const [
    activeBatches,
    expiredBatches,
    batches,
  ] = await Promise.all([
    prisma.inventoryBatch.count({
      where: {
        status: BatchStatus.ACTIVE,
      },
    }),

    prisma.inventoryBatch.count({
      where: {
        status: BatchStatus.EXPIRED,
      },
    }),

    prisma.inventoryBatch.findMany({
      select: {
        quantity: true,
      },
    }),
  ]);

  const totalUnits = batches.reduce(
    (sum, batch) => sum + batch.quantity,
    0
  );

  return {
    activeBatches,
    expiredBatches,
    totalUnits,
  };
};