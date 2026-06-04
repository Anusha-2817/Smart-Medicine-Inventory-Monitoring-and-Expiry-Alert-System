import { prisma } from "../../config/prisma";

export const createInventoryBatch = async (data: {
  medicineId: string;
  supplierId: string;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  manufacturingDate?: string;
  expiryDate: string;
}) => {

  const medicine = await prisma.medicine.findUnique({
    where: {
      id: data.medicineId,
    },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  const supplier = await prisma.supplier.findUnique({
    where: {
      id: data.supplierId,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (data.quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  if (data.unitCost <= 0) {
    throw new Error("Unit cost must be greater than 0");
  }

  const expiryDate = new Date(data.expiryDate);

  let manufacturingDate: Date | undefined;

  if (data.manufacturingDate) {
    manufacturingDate = new Date(data.manufacturingDate);

    if (expiryDate <= manufacturingDate) {
      throw new Error(
        "Expiry date must be later than manufacturing date"
      );
    }
  }

  return prisma.inventoryBatch.create({
    data: {
      medicineId: data.medicineId,
      supplierId: data.supplierId,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      unitCost: data.unitCost,
      manufacturingDate,
      expiryDate,
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });
};

export const getAllInventoryBatches = async () => {
  return prisma.inventoryBatch.findMany({
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getInventoryBatchById = async (
  id: string
) => {
  const batch = await prisma.inventoryBatch.findUnique({
    where: { id },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!batch) {
    throw new Error("Inventory batch not found");
  }

  return batch;
};

export const updateInventoryBatch = async (
  id: string,
  data: {
    medicineId?: string;
    supplierId?: string;
    batchNumber?: string;
    quantity?: number;
    unitCost?: number;
    manufacturingDate?: string;
    expiryDate?: string;
  }
) => {

  const batch = await prisma.inventoryBatch.findUnique({
    where: { id },
  });

  if (!batch) {
    throw new Error("Inventory batch not found");
  }

  if (data.medicineId) {
    const medicine = await prisma.medicine.findUnique({
      where: {
        id: data.medicineId,
      },
    });

    if (!medicine) {
      throw new Error("Medicine not found");
    }
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: data.supplierId,
      },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }
  }

  if (
    data.quantity !== undefined &&
    data.quantity < 0
  ) {
    throw new Error("Quantity cannot be negative");
  }

  if (
    data.unitCost !== undefined &&
    data.unitCost <= 0
  ) {
    throw new Error("Unit cost must be greater than 0");
  }

  const manufacturingDate =
    data.manufacturingDate
      ? new Date(data.manufacturingDate)
      : undefined;

  const expiryDate =
    data.expiryDate
      ? new Date(data.expiryDate)
      : undefined;

  if (
    manufacturingDate &&
    expiryDate &&
    expiryDate <= manufacturingDate
  ) {
    throw new Error(
      "Expiry date must be later than manufacturing date"
    );
  }

  return prisma.inventoryBatch.update({
    where: { id },
    data: {
      ...data,
      manufacturingDate,
      expiryDate,
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });
};

export const deleteInventoryBatch = async (
  id: string
) => {

  const batch = await prisma.inventoryBatch.findUnique({
    where: { id },
    include: {
      stockMovements: true,
      alerts: true,
    },
  });

  if (!batch) {
    throw new Error("Inventory batch not found");
  }

  if (
    batch.stockMovements.length > 0 ||
    batch.alerts.length > 0
  ) {
    throw new Error(
      "Cannot delete inventory batch with related records"
    );
  }

  return prisma.inventoryBatch.delete({
    where: { id },
  });
};