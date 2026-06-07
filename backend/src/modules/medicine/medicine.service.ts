import { prisma } from "../../config/prisma";

// LIST
export const getMedicines = async (params: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, category, status, page = 1, limit = 20 } = params;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { genericName: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.medicine.count({ where }),
  ]);
  return { data, total, page, limit };
};

// GET ONE
export const getMedicine = async (id: string) => {
  return prisma.medicine.findUniqueOrThrow({ where: { id } });
};

// CREATE
export const createMedicine = async (data: {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  sku: string;
  requiresPrescription?: boolean;
  reorderThreshold?: number;
}) => {
  return prisma.medicine.create({ data });
};

// UPDATE
export const updateMedicine = async (id: string, data: Partial<{
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  requiresPrescription: boolean;
  reorderThreshold: number;
  status: string;
}>) => {
  return prisma.medicine.update({ where: { id }, data: data as any });
};

// DELETE
export const deleteMedicine = async (id: string) => {
  return prisma.medicine.delete({ where: { id } });
};
