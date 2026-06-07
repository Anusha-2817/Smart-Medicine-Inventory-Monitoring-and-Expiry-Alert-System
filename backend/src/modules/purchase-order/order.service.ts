import { prisma } from "../../config/prisma";

export const getOrders = async (params: { status?: string; page?: number; limit?: number }) => {
  const { status, page = 1, limit = 20 } = params;
  const where: any = status ? { status } : {};
  const [data, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { name: true } }, items: { include: { medicine: { select: { name: true, sku: true } } } } },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const getOrder = async (id: string) =>
  prisma.purchaseOrder.findUniqueOrThrow({
    where: { id },
    include: { supplier: true, items: { include: { medicine: true } } },
  });

export const createOrder = async (data: {
  supplierId: string;
  createdBy: string;
  items: { medicineId: string; orderedQuantity: number; unitPrice: number }[];
}) => {
  const { supplierId, createdBy, items } = data;
  return prisma.purchaseOrder.create({
    data: {
      supplierId,
      createdBy,
      items: { create: items },
    },
    include: { supplier: true, items: true },
  });
};

export const updateOrderStatus = async (id: string, status: string) =>
  prisma.purchaseOrder.update({ where: { id }, data: { status: status as any } });

export const deleteOrder = async (id: string) =>
  prisma.purchaseOrder.delete({ where: { id } });
