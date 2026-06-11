/**
 * demo.service.ts
 * Generates realistic pharmacy demo data on-demand.
 * Used by the admin "Generate Demo Dataset" feature.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  PharmacySize,
  DATA_PROFILES,
  SUPPLIER_POOL,
  USER_POOL,
  MEDICINE_POOL,
  randInt,
  randFloat,
  pick,
  weightedPick,
  randDate,
  addDays,
  addMonths,
  generateExpiryDate,
  generateManufacturingDate,
  generateBatchNumber,
  generateQuantity,
  movementNote,
  movementQuantity,
  MOVEMENT_TYPES,
  PO_STATUS_WEIGHTS,
} from "../../utils/dataGenerator";

const prisma = new PrismaClient();

// ─── Status ───────────────────────────────────────────────────────────────────

export const getDemoStatus = async () => {
  const [
    users,
    suppliers,
    medicines,
    batches,
    expiredBatches,
    movements,
    orders,
    alerts,
    unresolvedAlerts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.supplier.count(),
    prisma.medicine.count(),
    prisma.inventoryBatch.count(),
    prisma.inventoryBatch.count({ where: { status: "EXPIRED" } }),
    prisma.stockMovement.count(),
    prisma.purchaseOrder.count(),
    prisma.alert.count(),
    prisma.alert.count({ where: { isResolved: false } }),
  ]);

  return {
    users,
    suppliers,
    medicines,
    batches,
    expiredBatches,
    movements,
    orders,
    alerts,
    unresolvedAlerts,
  };
};

// ─── Generate ─────────────────────────────────────────────────────────────────

export const generateDemoData = async (
  mode: PharmacySize,
  clearExisting: boolean,
) => {
  const profile = DATA_PROFILES[mode];
  const now = new Date();
  const threeYearsAgo = addMonths(now, -36);
  const oneYearAgo = addMonths(now, -12);

  // Optional: clear non-user inventory data
  if (clearExisting) {
    await prisma.alert.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.inventoryBatch.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.supplier.deleteMany();
  }

  // ── 1. Suppliers ─────────────────────────────────────────────────

  const supplierPool = SUPPLIER_POOL.slice(0, profile.suppliers);
  const createdSuppliers: any[] = [];

  for (const s of supplierPool) {
    let supplier = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: s });
    }
    createdSuppliers.push(supplier);
  }

  // ── 2. Users ─────────────────────────────────────────────────────

  const userPool = USER_POOL.slice(0, profile.users);
  const createdUsers: any[] = [];

  for (const u of userPool) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      const hash = await bcrypt.hash(u.pass, 10);
      const isActive = u.role === "ADMIN" ? true : Math.random() > 0.2;
      user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password_hash: hash,
          role: u.role as any,
          isActive,
          createdAt: randDate(threeYearsAgo, now),
        },
      });
    }
    createdUsers.push(user);
  }

  // ── 3. Medicines ─────────────────────────────────────────────────

  const medicinePool = Array.from(
    { length: profile.medicines },
    (_, i) => MEDICINE_POOL[i % MEDICINE_POOL.length],
  );

  const createdMedicines: any[] = [];
  for (let i = 0; i < medicinePool.length; i++) {
    const def = medicinePool[i];
    const sku = `MED-${String(i + 1).padStart(3, "0")}`;

    let medicine = await prisma.medicine.findUnique({ where: { sku } });
    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: {
          name:
            i < MEDICINE_POOL.length
              ? def.name
              : `${def.name} (${Math.floor(i / MEDICINE_POOL.length) + 1})`,
          genericName: def.genericName,
          category: def.category,
          manufacturer: def.manufacturer,
          sku,
          requiresPrescription: def.requiresPrescription,
          reorderThreshold: def.reorderThreshold,
          status: Math.random() > 0.05 ? "ACTIVE" : "DISCONTINUED",
        },
      });
    }
    createdMedicines.push({ ...medicine, _def: def });
  }

  // ── 4. Inventory Batches ─────────────────────────────────────────

  let batchSeq = Date.now() % 10000; // unique seed per run
  const createdBatches: any[] = [];

  const batchesPerMed = Math.ceil(profile.batches / profile.medicines);

  for (const med of createdMedicines) {
    const numBatches = randInt(
      Math.max(1, batchesPerMed - 1),
      batchesPerMed + 2,
    );
    const supplier = pick(createdSuppliers);
    const costRange: [number, number] = med._def?.unitCostRange ?? [5, 50];

    for (let b = 0; b < numBatches; b++) {
      batchSeq++;
      const { expiryDate, batchStatus } = generateExpiryDate(now);
      const manufacturingDate = generateManufacturingDate(expiryDate);
      const batchNumber = generateBatchNumber(
        supplier.name,
        expiryDate,
        batchSeq,
      );
      const unitCost = randFloat(costRange[0], costRange[1]);
      const quantity =
        batchStatus === "EXPIRED" ? randInt(0, 50) : generateQuantity();

      const existing = await prisma.inventoryBatch.findFirst({
        where: { medicineId: med.id, batchNumber },
      });
      if (existing) continue;

      const batch = await prisma.inventoryBatch.create({
        data: {
          medicineId: med.id,
          supplierId: supplier.id,
          batchNumber,
          quantity,
          unitCost,
          manufacturingDate,
          expiryDate,
          status: batchStatus,
        },
      });
      createdBatches.push(batch);
    }
  }

  // ── 5. Stock Movements ───────────────────────────────────────────

  const activeBatches = createdBatches.filter((b) => b.status === "ACTIVE");
  const activeUsers = createdUsers.filter((u) => u.isActive);
  const batchPool = activeBatches.length > 0 ? activeBatches : createdBatches;
  const userPool2 = activeUsers.length > 0 ? activeUsers : createdUsers;

  function movementDate(): Date {
    const r = Math.random();
    if (r < 0.1) return addDays(now, 0);
    if (r < 0.2) return addDays(now, -1);
    if (r < 0.35) return randDate(addDays(now, -7), now);
    if (r < 0.55) return randDate(addDays(now, -30), addDays(now, -7));
    return randDate(oneYearAgo, addDays(now, -30));
  }

  for (let i = 0; i < profile.movements; i++) {
    const batch = pick(batchPool);
    const user = pick(userPool2);
    const movementType = pick(MOVEMENT_TYPES);
    const quantity = Math.abs(movementQuantity(movementType));

    await prisma.stockMovement.create({
      data: {
        batchId: batch.id,
        userId: user.id,
        movementType: movementType as any,
        quantity,
        notes: movementNote(movementType),
        createdAt: movementDate(),
      },
    });
  }

  // ── 6. Purchase Orders ───────────────────────────────────────────

  const activeMeds = createdMedicines.filter((m) => m.status === "ACTIVE");

  for (let o = 0; o < profile.orders; o++) {
    const supplier = pick(createdSuppliers);
    const user = pick(createdUsers);
    const status = weightedPick(
      PO_STATUS_WEIGHTS.statuses as unknown as string[],
      PO_STATUS_WEIGHTS.weights,
    );
    const orderDate = randDate(addMonths(now, -8), now);
    const numItems = randInt(2, 8);
    const orderMeds = [...activeMeds]
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);

    await prisma.purchaseOrder.create({
      data: {
        supplierId: supplier.id,
        createdBy: user.id,
        status: status as any,
        createdAt: orderDate,
        items: {
          create: orderMeds.map((m: any) => {
            const ordered = randInt(50, 500);
            const received =
              status === "RECEIVED"
                ? randInt(Math.floor(ordered * 0.8), ordered)
                : 0;
            const costRange: [number, number] = m._def?.unitCostRange ?? [
              5, 50,
            ];
            return {
              medicineId: m.id,
              orderedQuantity: ordered,
              receivedQuantity: received,
              unitPrice: randFloat(costRange[0], costRange[1]),
            };
          }),
        },
      },
    });
  }

  // ── 7. Alerts ────────────────────────────────────────────────────

  const allBatches = await prisma.inventoryBatch.findMany({
    include: { medicine: { select: { name: true, reorderThreshold: true } } },
  });

  // Fetch eligible users for notifications (ADMIN and PHARMACIST only)
  const eligibleUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PHARMACIST"] } },
  });

  const in7Days = addDays(now, 7);
  const in30Days = addDays(now, 30);
  let alertsCreated = 0;

  for (const batch of allBatches) {
    const alertsToCreate: any[] = [];

    if (batch.status === "EXPIRED" || batch.expiryDate < now) {
      alertsToCreate.push({
        alertType: "EXPIRY",
        severity: "CRITICAL",
        message: `Batch ${batch.batchNumber} (${batch.medicine.name}) has EXPIRED. Immediate quarantine required.`,
        isResolved: Math.random() > 0.6,
        createdAt: addDays(batch.expiryDate, 1),
      });
    } else if (batch.expiryDate <= in7Days) {
      alertsToCreate.push({
        alertType: "EXPIRY",
        severity: "CRITICAL",
        message: `Batch ${batch.batchNumber} (${batch.medicine.name}) expires within 7 days. Prioritise dispensing.`,
        isResolved: Math.random() > 0.5,
        createdAt: addDays(now, -randInt(0, 2)),
      });
    } else if (batch.expiryDate <= in30Days) {
      alertsToCreate.push({
        alertType: "EXPIRY",
        severity: "WARNING",
        message: `Batch ${batch.batchNumber} (${batch.medicine.name}) expires within 30 days.`,
        isResolved: Math.random() > 0.7,
        createdAt: addDays(now, -randInt(1, 7)),
      });
    }

    if (
      batch.status === "ACTIVE" &&
      batch.quantity <= batch.medicine.reorderThreshold
    ) {
      const isCritical = batch.quantity < batch.medicine.reorderThreshold * 0.3;
      alertsToCreate.push({
        alertType: "LOW_STOCK",
        severity: isCritical ? "CRITICAL" : "WARNING",
        message: `${batch.medicine.name} — batch ${batch.batchNumber} is low (${batch.quantity} units, threshold: ${batch.medicine.reorderThreshold}).`,
        isResolved: Math.random() > 0.65,
        createdAt: addDays(now, -randInt(0, 14)),
      });
    }

    if (
      batch.status === "ACTIVE" &&
      batch.quantity > 200 &&
      batch.expiryDate <= in30Days
    ) {
      alertsToCreate.push({
        alertType: "DEAD_STOCK",
        severity: "INFO",
        message: `Batch ${batch.batchNumber} (${batch.medicine.name}) has ${batch.quantity} units but expires in < 30 days.`,
        isResolved: Math.random() > 0.5,
        createdAt: addDays(now, -randInt(1, 10)),
      });
    }

    for (const a of alertsToCreate) {
      const createdAlert = await prisma.alert.create({
        data: {
          batchId: batch.id,
          alertType: a.alertType,
          severity: a.severity,
          message: a.message,
          isResolved: a.isResolved,
          resolvedAt: a.isResolved
            ? addDays(a.createdAt, randInt(1, 10))
            : null,
          createdAt: a.createdAt,
        },
      });

      // Create notifications for eligible users
      for (const user of eligibleUsers) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Inventory Alert",
            message: a.message,
            type: a.severity,
            alertId: createdAlert.id,
            createdAt: a.createdAt,
          },
        });
      }

      alertsCreated++;
    }
  }

  // ── Return Summary ───────────────────────────────────────────────

  return {
    mode,
    profile,
    generated: {
      suppliers: createdSuppliers.length,
      users: createdUsers.length,
      medicines: createdMedicines.length,
      batches: createdBatches.length,
      movements: profile.movements,
      purchaseOrders: profile.orders,
      alerts: alertsCreated,
    },
  };
};
