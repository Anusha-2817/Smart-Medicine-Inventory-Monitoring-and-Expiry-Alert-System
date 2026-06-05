import { prisma } from "../../config/prisma";

export const getAllNotifications = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markAsRead = async (
  id: string
) => {
  const notification =
    await prisma.notification.findUnique({
      where: { id },
    });

  if (!notification) {
    throw new Error(
      "Notification not found"
    );
  }

  return prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
    },
  });
};

export const markAllAsRead = async (
  userId: string
) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};