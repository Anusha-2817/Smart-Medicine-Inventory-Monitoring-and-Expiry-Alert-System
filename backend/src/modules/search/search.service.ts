import { prisma } from "../../config/prisma";

export const performGlobalSearch = async (query: string) => {
  const searchStr = query.trim();
  if (!searchStr) {
    return {
      medicines: [],
      inventory: [],
      suppliers: [],
      orders: [],
      alerts: [],
      users: [],
    };
  }

  const [medicines, inventory, suppliers, orders, alerts, users] = await Promise.all([
    // Medicines
    prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: searchStr, mode: "insensitive" } },
          { genericName: { contains: searchStr, mode: "insensitive" } },
          { sku: { contains: searchStr, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    
    // Inventory Batches
    prisma.inventoryBatch.findMany({
      where: {
        OR: [
          { batchNumber: { contains: searchStr, mode: "insensitive" } },
          {
            medicine: {
              name: { contains: searchStr, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        medicine: true,
      },
      take: 5,
    }),
    
    // Suppliers
    prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: searchStr, mode: "insensitive" } },
          { email: { contains: searchStr, mode: "insensitive" } },
          { contactPerson: { contains: searchStr, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    
    // Purchase Orders
    prisma.purchaseOrder.findMany({
      where: {
        OR: [
          {
            supplier: {
              name: { contains: searchStr, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        supplier: true,
        user: true,
      },
      take: 5,
    }),
    
    // Alerts
    prisma.alert.findMany({
      where: {
        message: { contains: searchStr, mode: "insensitive" },
      },
      include: {
        batch: {
          include: {
            medicine: true,
          },
        },
      },
      take: 5,
    }),
    
    // Users
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchStr, mode: "insensitive" } },
          { email: { contains: searchStr, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 5,
    }),
  ]);

  return {
    medicines,
    inventory,
    suppliers,
    orders,
    alerts,
    users,
  };
};
