import { prisma } from "../../config/prisma";
import { MovementType, Prisma } from "@prisma/client";

const test = MovementType.STOCK_IN;
export const recordStockIn = async (
  userId: string,
  payload: {
    batchId: string;
    quantity: number;
    notes?: string;
  }
) => {

  if (payload.quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  return prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {

    const batch =
      await tx.inventoryBatch.findUnique({
        where: {
          id: payload.batchId,
        },
      });

    if (!batch) {
      throw new Error(
        "Inventory batch not found"
      );
    }

    const updatedBatch =
      await tx.inventoryBatch.update({
        where: {
          id: payload.batchId,
        },
        data: {
          quantity: {
            increment: payload.quantity,
          },
        },
      });

    const movement =
      await tx.stockMovement.create({
        data: {
          batchId: payload.batchId,
          userId,
          movementType: MovementType.STOCK_IN,
          quantity: payload.quantity,
          notes: payload.notes,
        },
      });

    return {
      updatedBatch,
      movement,
    };
  });
};

export const recordStockOut = async (
  userId: string,
  payload: {
    batchId: string;
    quantity: number;
    notes?: string;
  }
) => {

  if (payload.quantity <= 0) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  return prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {

    const batch =
      await tx.inventoryBatch.findUnique({
        where: {
          id: payload.batchId,
        },
      });

    if (!batch) {
      throw new Error(
        "Inventory batch not found"
      );
    }

    if (batch.quantity < payload.quantity) {
      throw new Error(
        `Insufficient stock. Available: ${batch.quantity}, Requested: ${payload.quantity}`
      );
    }

    const updatedBatch =
      await tx.inventoryBatch.update({
        where: {
          id: payload.batchId,
        },
        data: {
          quantity: {
            decrement: payload.quantity,
          },
        },
      });

    const movement =
      await tx.stockMovement.create({
        data: {
          batchId: payload.batchId,
          userId,
          movementType: MovementType.STOCK_OUT,
          quantity: payload.quantity,
          notes: payload.notes,
        },
      });

    return {
      updatedBatch,
      movement,
    };
  });
};

export const recordAdjustment = async (
  userId: string,
  payload: {
    batchId: string;
    quantity: number;
    notes?: string;
  }
) => {

  if (payload.quantity === 0) {
    throw new Error(
      "Adjustment quantity cannot be 0"
    );
  }

  return prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {

    const batch =
      await tx.inventoryBatch.findUnique({
        where: {
          id: payload.batchId,
        },
      });

    if (!batch) {
      throw new Error(
        "Inventory batch not found"
      );
    }

    const newQuantity =
      batch.quantity + payload.quantity;

    if (newQuantity < 0) {
      throw new Error(
        "Adjustment would result in negative stock"
      );
    }

    const updatedBatch =
      await tx.inventoryBatch.update({
        where: {
          id: payload.batchId,
        },
        data: {
          quantity: newQuantity,
        },
      });

    const movement =
      await tx.stockMovement.create({
        data: {
          batchId: payload.batchId,
          userId,
          movementType: MovementType.ADJUSTMENT,
          quantity: payload.quantity,
          notes: payload.notes,
        },
      });

    return {
      updatedBatch,
      movement,
    };
  });
};

export const getAllStockMovements = async () => {
  return prisma.stockMovement.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      batch: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getStockMovementById = async (
  id: string
) => {

  const movement =
    await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        batch: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

  if (!movement) {
    throw new Error(
      "Stock movement not found"
    );
  }

  return movement;
};