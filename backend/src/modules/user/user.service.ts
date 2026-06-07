import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";

export const getUsers = async (params: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 20 } = params;
  const where: any = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return { data, total, page, limit };
};

export const createUser = async (data: {
  name: string;
  email: string;
  role: "ADMIN" | "PHARMACIST" | "STAFF";
  isActive?: boolean;
  password?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hash = await bcrypt.hash(data.password || "123456", 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive ?? true,
      password_hash: hash
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const updateUser = async (id: string, data: Partial<{
  name: string;
  email: string;
  role: "ADMIN" | "PHARMACIST" | "STAFF";
  isActive: boolean;
  password?: string;
}>) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      throw new Error("Email is already in use by another user");
    }
    updateData.email = data.email;
  }
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) {
    updateData.password_hash = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};
