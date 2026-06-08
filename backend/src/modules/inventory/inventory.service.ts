import { prisma } from "../../config/prisma";

export const getInventory = async (params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, status, page = 1, limit = 20 } = params;
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { batchNumber: { contains: search, mode: "insensitive" } },
      { medicine: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.inventoryBatch.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        medicine: { select: { name: true, category: true, sku: true, reorderThreshold: true } },
        supplier: { select: { name: true } },
      },
    }),
    prisma.inventoryBatch.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const createBatch = async (data: {
  medicineId: string;
  supplierId: string;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate: string;
  manufacturingDate?: string;
}) => {
  return prisma.inventoryBatch.create({ data: { ...data, unitCost: data.unitCost } });
};

export const updateBatch = async (id: string, data: Partial<{
  quantity: number;
  unitCost: number;
  expiryDate: string;
  status: string;
}>) => {
  return prisma.inventoryBatch.update({ where: { id }, data: data as any });
};

export const getExpiringBatches = async (days: number) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return prisma.inventoryBatch.findMany({
    where: { status: "ACTIVE", expiryDate: { lte: cutoff } },
    include: {
      medicine: { select: { name: true, sku: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
  });
};
