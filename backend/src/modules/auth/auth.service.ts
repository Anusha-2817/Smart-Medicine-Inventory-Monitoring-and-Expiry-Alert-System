import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
    },
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  name?: string,
  email?: string,
  password?: string
) => {
  const data: any = {};
  if (name) data.name = name;
  if (email) {
    // Check if email is already taken by someone else
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new Error("Email is already in use by another account");
    }
    data.email = email;
  }
  if (password) {
    data.password_hash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return user;
};