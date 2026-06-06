import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createPurchaseOrder = async (
  supplierId: string,
  createdBy: string,
  items: {
    medicineId: string;
    orderedQuantity: number;
    unitPrice: number;
  }[],
) => {
  return prisma.purchaseOrder.create({
    data: {
      supplierId,
      createdBy,

      items: {
        create: items.map((item) => ({
          medicineId: item.medicineId,
          orderedQuantity: item.orderedQuantity,
          unitPrice: item.unitPrice,
        })),
      },
    },

    include: {
      supplier: true,
      items: true,
    },
  });
};

export const getAllPurchaseOrders = async () => {
  return prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPurchaseOrderById = async (id: string) => {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },

    include: {
      supplier: true,
      items: {
        include: {
          medicine: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Purchase order not found");
  }

  return order;
};

export const updatePurchaseOrderStatus = async (
  id: string,
  status: OrderStatus,
  batches?: {
    medicineId: string;
    batchNumber: string;
    manufacturingDate: string;
    expiryDate: string;
  }[],
) => {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },

    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Purchase order not found");
  }

  if (status === OrderStatus.RECEIVED) {
    if (!batches) {
      throw new Error("Batch information is required");
    }

    for (const item of order.items) {
      const batchData = batches.find(
        (batch) => batch.medicineId === item.medicineId,
      );

      if (!batchData) {
        throw new Error(`Missing batch data for medicine ${item.medicineId}`);
      }

      const inventoryBatch = await prisma.inventoryBatch.create({
        data: {
          medicineId: item.medicineId,

          supplierId: order.supplierId,

          batchNumber: batchData.batchNumber,

          quantity: item.orderedQuantity,

          unitCost: item.unitPrice,

          manufacturingDate: new Date(batchData.manufacturingDate),

          expiryDate: new Date(batchData.expiryDate),
        },
      });

      const admin = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
        },
      });

      if (!admin) {
        throw new Error("Admin user not found");
      }

      await prisma.stockMovement.create({
        data: {
          batchId: inventoryBatch.id,

          userId: admin.id,

          movementType: "STOCK_IN",

          quantity: item.orderedQuantity,

          notes: `PO ${order.id} received`,
        },
      });
    }
  }

  return prisma.purchaseOrder.update({
    where: { id },

    data: {
      status,
    },
  });
};
