import { prisma } from "../../config/prisma";

export const createSupplier = async (data: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}) => {
  if (!data.name) {
    throw new Error("Supplier name is required");
  }

  return prisma.supplier.create({
    data,
  });
};

export const getAllSuppliers = async () => {
  return prisma.supplier.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getSupplierById = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
};

export const updateSupplier = async (
  id: string,
  data: {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  },
) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return prisma.supplier.update({
    where: { id },
    data,
  });
};

export const deleteSupplier = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      inventoryBatches: true,
      purchaseOrders: true,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (
    supplier.inventoryBatches.length > 0 ||
    supplier.purchaseOrders.length > 0
  ) {
    throw new Error("Cannot delete supplier with related records");
  }

  return prisma.supplier.delete({
    where: { id },
  });
};
