import { AlertType, Severity,BatchStatus,NotificationType,} from "@prisma/client";
import { prisma } from "../../config/prisma";

export const getAllAlerts = async () => {
  return prisma.alert.findMany({
    include: {
      medicine: true,
      batch: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const resolveAlert = async (
  id: string
) => {
  const alert = await prisma.alert.findUnique({
    where: { id },
  });

  if (!alert) {
    throw new Error("Alert not found");
  }

  return prisma.alert.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });
};

export const generateLowStockAlerts =
  async () => {
    const medicines =
      await prisma.medicine.findMany({
        include: {
          inventoryBatches: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      });

    for (const medicine of medicines) {
      const totalStock =
        medicine.inventoryBatches.reduce(
          (sum, batch) =>
            sum + batch.quantity,
          0
        );

      if (
        totalStock <=
        medicine.reorderThreshold
      ) {
        const existingAlert =
          await prisma.alert.findFirst({
            where: {
              medicineId: medicine.id,
              alertType:
                AlertType.LOW_STOCK,
              isResolved: false,
            },
          });

        if (existingAlert) {
          continue;
        }

        const alert = await prisma.alert.create({
        data: {
            medicineId: medicine.id,
            alertType: AlertType.LOW_STOCK,
            severity: Severity.WARNING,
            message:
            `${medicine.name} stock is below reorder threshold`,
        },
        });
        const users =
            await prisma.user.findMany({
                where: {
                role: {
                    in: ["ADMIN", "PHARMACIST"],
                },
                },
        });

        for (const user of users) {
        await prisma.notification.create({
            data: {
            userId: user.id,
            title: "Low Stock Alert",
            message: alert.message,
            type: NotificationType.WARNING,
            },
        });
        }
      }
    }
  };

  export const generateExpiryAlerts =
  async () => {
    const batches =
      await prisma.inventoryBatch.findMany({
        where: {
          status: BatchStatus.ACTIVE,
        },
        include: {
          medicine: true,
        },
      });

    const today = new Date();

    for (const batch of batches) {
      const daysRemaining = Math.ceil(
        (
          batch.expiryDate.getTime() -
          today.getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );

      let severity: Severity | null =
        null;

      if (daysRemaining <= 0) {
        severity = Severity.CRITICAL;

        await prisma.inventoryBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            status:
              BatchStatus.EXPIRED,
          },
        });
      } else if (
        daysRemaining <= 30
      ) {
        severity = Severity.WARNING;
      } else if (
        daysRemaining <= 90
      ) {
        severity = Severity.INFO;
      }

      if (!severity) {
        continue;
      }

      const existingAlert =
  await prisma.alert.findFirst({
    where: {
      batchId: batch.id,
      alertType: AlertType.EXPIRY,
      isResolved: false,
    },
  });

    const message =
    daysRemaining <= 0
        ? `${batch.medicine.name} batch ${batch.batchNumber} has expired`
        : `${batch.medicine.name} batch ${batch.batchNumber} expires in ${daysRemaining} day(s)`;

    if (existingAlert) {
    await prisma.alert.update({
        where: {
        id: existingAlert.id,
        },
        data: {
        severity,
        message,
        updatedAt: new Date(),
        },
    });

    continue;
    }
    const alert = await prisma.alert.create({
        data: {
            medicineId: batch.medicineId,
            batchId: batch.id,
            alertType: AlertType.EXPIRY,
            severity,
            message,
        },
        });
        const users =
        await prisma.user.findMany({
            where: {
            role: {
                in: ["ADMIN", "PHARMACIST"],
            },
            },
        });

        for (const user of users) {
        await prisma.notification.create({
            data: {
            userId: user.id,
            title: "Expiry Alert",
            message: alert.message,
            type:
                severity === Severity.CRITICAL
                ? NotificationType.CRITICAL
                : severity === Severity.WARNING
                ? NotificationType.WARNING
                : NotificationType.INFO,
            },
        });
        }
    }
  };