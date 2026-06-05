import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createPurchaseOrder =
  async (
    supplierId: string,
    createdBy: string,
    items: {
      medicineId: string;
      orderedQuantity: number;
      unitPrice: number;
    }[]
  ) => {
    return prisma.purchaseOrder.create({
      data: {
        supplierId,
        createdBy,

        items: {
          create: items.map(
            (item) => ({
              medicineId:
                item.medicineId,
              orderedQuantity:
                item.orderedQuantity,
              unitPrice:
                item.unitPrice,
            })
          ),
        },
      },

      include: {
        supplier: true,
        items: true,
      },
    });
  };

export const getAllPurchaseOrders =
  async () => {
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

export const getPurchaseOrderById =
  async (id: string) => {
    const order =
      await prisma.purchaseOrder.findUnique({
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
      throw new Error(
        "Purchase order not found"
      );
    }

    return order;
  };

export const updatePurchaseOrderStatus =
  async (
    id: string,
    status: OrderStatus
  ) => {
    const order =
      await prisma.purchaseOrder.findUnique({
        where: { id },
      });

    if (!order) {
      throw new Error(
        "Purchase order not found"
      );
    }

    return prisma.purchaseOrder.update({
      where: { id },

      data: {
        status,
      },
    });
  };