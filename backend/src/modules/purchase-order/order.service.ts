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

export const updateOrderStatus = async (id: string, status: string, userId?: string) => {
  if (status === "RECEIVED") {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });

      if (order.status !== "ORDERED") {
        throw new Error("Only ORDERED purchase orders can be received.");
      }

      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        
        // Auto-generate batch number
        const batchNumber = `PO-${order.id.split("-")[0].toUpperCase()}-${i + 1}`;
        
        // Default expiry date: 1 year from now
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Create the InventoryBatch
        const batch = await tx.inventoryBatch.create({
          data: {
            medicineId: item.medicineId,
            supplierId: order.supplierId,
            batchNumber,
            quantity: item.orderedQuantity,
            unitCost: item.unitPrice,
            expiryDate,
          },
        });

        // Create the StockMovement
        await tx.stockMovement.create({
          data: {
            batchId: batch.id,
            movementType: "STOCK_IN",
            quantity: item.orderedQuantity,
            userId: userId || order.createdBy,
            notes: `Received from Purchase Order ${order.id.split("-")[0]}`,
          },
        });

        // Update the received quantity on the PO item
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQuantity: item.orderedQuantity },
        });
      }

      // Update the overall PO status
      return tx.purchaseOrder.update({
        where: { id },
        data: { status: "RECEIVED" },
      });
    });
  }

  // Normal status update
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status: status as any },
  });
};

export const deleteOrder = async (id: string) =>
  prisma.purchaseOrder.delete({ where: { id } });
