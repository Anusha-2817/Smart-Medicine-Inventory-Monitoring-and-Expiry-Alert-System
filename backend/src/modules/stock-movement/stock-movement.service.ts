import { prisma } from "../../config/prisma";

export const getMovements = async (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 20 } = params;
  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          include: {
            medicine: { select: { name: true } }
          }
        },
        user: { select: { name: true } }
      }
    }),
    prisma.stockMovement.count(),
  ]);
  return { data, total, page, limit };
};

export const createMovement = async (userId: string, data: {
  batchId: string;
  movementType: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "EXPIRED" | "RETURNED";
  quantity: number;
  notes?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const batch = await tx.inventoryBatch.findUniqueOrThrow({
      where: { id: data.batchId }
    });

    let newQuantity = batch.quantity;
    const qty = Number(data.quantity);

    if (data.movementType === "STOCK_IN" || data.movementType === "RETURNED") {
      newQuantity += qty;
    } else if (data.movementType === "STOCK_OUT" || data.movementType === "EXPIRED") {
      newQuantity -= qty;
    } else if (data.movementType === "ADJUSTMENT") {
      newQuantity += qty;
    }

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock in batch. New quantity would be ${newQuantity}`);
    }

    // Update batch quantity
    await tx.inventoryBatch.update({
      where: { id: data.batchId },
      data: { quantity: newQuantity }
    });

    // Create the stock movement
    return tx.stockMovement.create({
      data: {
        batchId: data.batchId,
        userId: userId,
        movementType: data.movementType,
        quantity: qty,
        notes: data.notes
      },
      include: {
        batch: {
          include: {
            medicine: { select: { name: true } }
          }
        },
        user: { select: { name: true } }
      }
    });
  });
};
