import { prisma } from "../../config/prisma";

export const getSuppliers = async (params: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 20 } = params;
  const where: any = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
    : {};
  const [data, total] = await Promise.all([
    prisma.supplier.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.supplier.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const getSupplier = async (id: string) => prisma.supplier.findUniqueOrThrow({ where: { id } });

export const createSupplier = async (data: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}) => prisma.supplier.create({ data });

export const updateSupplier = async (id: string, data: Partial<{
  name: string; contactPerson: string; phone: string; email: string; address: string;
}>) => prisma.supplier.update({ where: { id }, data });

export const deleteSupplier = async (id: string) => prisma.supplier.delete({ where: { id } });
