import { prisma } from "../../config/prisma";

export const createMedicine = async (data: {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  sku: string;
  requiresPrescription?: boolean;
  reorderThreshold?: number;
}) => {
  const existingMedicine = await prisma.medicine.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingMedicine) {
    throw new Error("Medicine with this SKU already exists");
  }

  return prisma.medicine.create({
    data,
  });
};

export const getAllMedicines = async () => {
  return prisma.medicine.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getMedicineById = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  return medicine;
};

export const updateMedicine = async (
  id: string,
  data: {
    name?: string;
    genericName?: string;
    category?: string;
    manufacturer?: string;
    sku?: string;
    requiresPrescription?: boolean;
    reorderThreshold?: number;
  },
) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  if (data.sku) {
    const existingSku = await prisma.medicine.findFirst({
      where: {
        sku: data.sku,
        NOT: {
          id,
        },
      },
    });

    if (existingSku) {
      throw new Error("Medicine with this SKU already exists");
    }
  }
  console.log("SERVICE DATA:", data);
  return prisma.medicine.update({
    where: { id },
    data,
  });
};

export const deleteMedicine = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      inventoryBatches: true,
    },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  if (medicine.inventoryBatches.length > 0) {
    throw new Error("Cannot delete medicine with inventory batches");
  }

  return prisma.medicine.delete({
    where: { id },
  });
};
