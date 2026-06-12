/**
 * seed.ts — Realistic Pharmacy Inventory Seed
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates production-grade demo data:
 *  • 20 suppliers
 *  • 125 medicines across 10 categories
 *  • 20 users (Admin / Pharmacist / Staff, mixed active/inactive)
 *  • ~400 inventory batches with realistic expiry distribution
 *  • ~1200 stock movements across the last 12 months
 *  • ~60 purchase orders with varied statuses
 *  • Realistic alerts derived from actual batch states
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
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
} from "./utils/dataGenerator";

const prisma = new PrismaClient();

// ─── Config ───────────────────────────────────────────────────────────────────

const TARGET = {
  suppliers: 20,
  users: 20,
  medicines: 125,
  batchesPerMedicine: [2, 5], // each medicine gets 2–5 batches
  movements: 1200,
  purchaseOrders: 60,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Starting realistic pharmacy seed...\n");

  const now = new Date();
  const threeYearsAgo = addMonths(now, -36);
  const oneYearAgo = addMonths(now, -12);

  // ──────────────────────────────────────────────────────────────────
  // STEP 1 — SUPPLIERS
  // ──────────────────────────────────────────────────────────────────
  console.log("📦 [1/7] Creating suppliers…");

  const supplierPool = SUPPLIER_POOL.slice(0, TARGET.suppliers);
  const createdSuppliers: any[] = [];

  for (const s of supplierPool) {
    let supplier = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: s });
    }
    createdSuppliers.push(supplier);
  }
  log(`✅ ${createdSuppliers.length} suppliers ready`);

  // ──────────────────────────────────────────────────────────────────
  // STEP 2 — USERS
  // ──────────────────────────────────────────────────────────────────
  console.log("👥 [2/7] Creating users…");

  const userPool = USER_POOL.slice(0, TARGET.users);
  const createdUsers: any[] = [];

  // Inactive probability: ~20% of non-admin users
  for (const u of userPool) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      const hash = await bcrypt.hash(u.pass, 10);
      const isActive = u.role === "ADMIN" ? true : Math.random() > 0.2;
      const createdAt = randDate(threeYearsAgo, now);
      user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password_hash: hash,
          role: u.role as any,
          isActive,
          createdAt,
        },
      });
    }
    createdUsers.push(user);
  }
  log(`✅ ${createdUsers.length} users ready`);

  // ──────────────────────────────────────────────────────────────────
  // STEP 3 — MEDICINES
  // ──────────────────────────────────────────────────────────────────
  console.log("💊 [3/7] Creating medicines…");

  // Take up to TARGET.medicines from pool, cycling if needed
  const medicinePool = Array.from(
    { length: TARGET.medicines },
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
  log(`✅ ${createdMedicines.length} medicines ready`);

  // ──────────────────────────────────────────────────────────────────
  // STEP 4 — INVENTORY BATCHES
  // ──────────────────────────────────────────────────────────────────
  console.log("📊 [4/7] Creating inventory batches…");

  let batchSeq = 1000;
  const createdBatches: any[] = [];

  for (const med of createdMedicines) {
    const numBatches = randInt(
      TARGET.batchesPerMedicine[0],
      TARGET.batchesPerMedicine[1],
    );
    const supplier = pick(createdSuppliers);
    const costRange: [number, number] = med._def.unitCostRange ?? [5, 50];

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

      // Check uniqueness on (medicineId, batchNumber)
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
  log(`✅ ${createdBatches.length} inventory batches ready`);

  // ──────────────────────────────────────────────────────────────────
  // STEP 5 — STOCK MOVEMENTS (1200+, spread over 12 months)
  // ──────────────────────────────────────────────────────────────────
  console.log("🔄 [5/7] Creating stock movements…");

  const existingMovementCount = await prisma.stockMovement.count();
  if (existingMovementCount < 100) {
    const activeBatches = createdBatches.filter((b) => b.status === "ACTIVE");
    const activeUsers = createdUsers.filter((u) => u.isActive);

    // Weight recent dates more heavily (pharmacy is more active recently)
    function generateMovementDate(): Date {
      const r = Math.random();
      if (r < 0.1) return addDays(now, 0); // today
      if (r < 0.2) return addDays(now, -1); // yesterday
      if (r < 0.35) return randDate(addDays(now, -7), now); // this week
      if (r < 0.55) return randDate(addDays(now, -30), addDays(now, -7)); // last month
      return randDate(oneYearAgo, addDays(now, -30)); // past year
    }

    let movementsCreated = 0;
    const batchForMovement =
      activeBatches.length > 0 ? activeBatches : createdBatches;

    for (let i = 0; i < TARGET.movements; i++) {
      const batch = pick(batchForMovement);
      const user = pick(activeUsers.length > 0 ? activeUsers : createdUsers);
      const movementType = pick(MOVEMENT_TYPES);
      const quantity = Math.abs(movementQuantity(movementType));
      const createdAt = generateMovementDate();

      await prisma.stockMovement.create({
        data: {
          batchId: batch.id,
          userId: user.id,
          movementType: movementType as any,
          quantity,
          notes: movementNote(movementType),
          createdAt,
        },
      });
      movementsCreated++;
    }
    log(`✅ ${movementsCreated} stock movements created`);
  } else {
    log(
      `ℹ️  Stock movements already seeded (${existingMovementCount} existing)`,
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 6 — PURCHASE ORDERS
  // ──────────────────────────────────────────────────────────────────
  console.log("🛒 [6/7] Creating purchase orders…");

  const existingOrderCount = await prisma.purchaseOrder.count();
  if (existingOrderCount < 10) {
    const activeMeds = createdMedicines.filter((m) => m.status === "ACTIVE");

    for (let o = 0; o < TARGET.purchaseOrders; o++) {
      const supplier = pick(createdSuppliers);
      const user = pick(createdUsers);
      const status = weightedPick(
        PO_STATUS_WEIGHTS.statuses as unknown as string[],
        PO_STATUS_WEIGHTS.weights,
      );

      // Order date: spread over last 8 months, some overdue
      const orderDate = randDate(addMonths(now, -8), now);

      // Pick 2–8 medicines for this order
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
                  ? randInt(Math.floor(ordered * 0.8), ordered) // 80–100% received
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
    log(`✅ ${TARGET.purchaseOrders} purchase orders created`);
  } else {
    log(`ℹ️  Purchase orders already seeded (${existingOrderCount} existing)`);
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 7 — ALERTS (derived from real batch states)
  // ──────────────────────────────────────────────────────────────────
  console.log("🚨 [7/7] Creating alerts…");

  const existingAlertCount = await prisma.alert.count();
  if (existingAlertCount < 10) {
    const allBatches = await prisma.inventoryBatch.findMany({
      include: { medicine: { select: { name: true, reorderThreshold: true } } },
    });

    // Fetch eligible users for notifications (ADMIN and PHARMACIST only)
    const eligibleUsers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "PHARMACIST"] } },
    });

    let alertsCreated = 0;
    const in7Days = addDays(now, 7);
    const in30Days = addDays(now, 30);

    for (const batch of allBatches) {
      const alertsForBatch: {
        alertType: "EXPIRY" | "LOW_STOCK" | "DEAD_STOCK";
        severity: "INFO" | "WARNING" | "CRITICAL";
        message: string;
        isResolved: boolean;
        resolvedAt?: Date;
        createdAt: Date;
      }[] = [];

      // EXPIRY alerts
      if (batch.status === "EXPIRED" || batch.expiryDate < now) {
        alertsForBatch.push({
          alertType: "EXPIRY",
          severity: "CRITICAL",
          message: `Batch ${batch.batchNumber} (${batch.medicine.name}) has EXPIRED. Immediate quarantine required.`,
          isResolved: Math.random() > 0.6, // 40% unresolved
          createdAt: addDays(batch.expiryDate, 1),
        });
      } else if (batch.expiryDate <= in7Days) {
        alertsForBatch.push({
          alertType: "EXPIRY",
          severity: "CRITICAL",
          message: `Batch ${batch.batchNumber} (${batch.medicine.name}) expires within 7 days. Prioritise dispensing.`,
          isResolved: Math.random() > 0.5,
          createdAt: addDays(now, -randInt(0, 2)),
        });
      } else if (batch.expiryDate <= in30Days) {
        alertsForBatch.push({
          alertType: "EXPIRY",
          severity: "WARNING",
          message: `Batch ${batch.batchNumber} (${batch.medicine.name}) expires within 30 days. Reorder advised.`,
          isResolved: Math.random() > 0.7,
          createdAt: addDays(now, -randInt(1, 7)),
        });
      }

      // LOW STOCK alerts
      if (
        batch.status === "ACTIVE" &&
        batch.quantity <= batch.medicine.reorderThreshold
      ) {
        const isCritical =
          batch.quantity < batch.medicine.reorderThreshold * 0.3;
        alertsForBatch.push({
          alertType: "LOW_STOCK",
          severity: isCritical ? "CRITICAL" : "WARNING",
          message: `${batch.medicine.name} — batch ${batch.batchNumber} is ${isCritical ? "critically" : ""} low (${batch.quantity} units remaining, threshold: ${batch.medicine.reorderThreshold}).`,
          isResolved: Math.random() > 0.65,
          createdAt: addDays(now, -randInt(0, 14)),
        });
      }

      // DEAD STOCK alert (quantity > 0 but batch expiring very soon with lots of stock)
      if (
        batch.status === "ACTIVE" &&
        batch.quantity > 200 &&
        batch.expiryDate <= in30Days
      ) {
        alertsForBatch.push({
          alertType: "DEAD_STOCK",
          severity: "INFO",
          message: `Batch ${batch.batchNumber} (${batch.medicine.name}) has ${batch.quantity} units but expires in < 30 days. Consider bulk dispense.`,
          isResolved: Math.random() > 0.5,
          createdAt: addDays(now, -randInt(1, 10)),
        });
      }

      for (const alertData of alertsForBatch) {
        const resolvedAt = alertData.isResolved
          ? addDays(alertData.createdAt, randInt(1, 10))
          : undefined;

        const createdAlert = await prisma.alert.create({
          data: {
            batchId: batch.id,
            alertType: alertData.alertType,
            severity: alertData.severity,
            message: alertData.message,
            isResolved: alertData.isResolved,
            resolvedAt: resolvedAt ?? null,
            createdAt: alertData.createdAt,
          },
        });

        // Create notifications for eligible users
        for (const user of eligibleUsers) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "Inventory Alert",
              message: alertData.message,
              type: alertData.severity,
              createdAt: alertData.createdAt,
            },
          });
        }

        alertsCreated++;
      }
    }
    log(`✅ ${alertsCreated} alerts created`);
  } else {
    log(`ℹ️  Alerts already seeded (${existingAlertCount} existing)`);
  }

  // ──────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────
  const [
    totalUsers,
    totalSuppliers,
    totalMedicines,
    totalBatches,
    expiredBatches,
    totalMovements,
    totalOrders,
    totalAlerts,
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

  console.log(`
╔═══════════════════════════════════════════╗
║         ✅ Seed Complete — Summary        ║
╠═══════════════════════════════════════════╣
║  Users           : ${String(totalUsers).padEnd(23)}║
║  Suppliers       : ${String(totalSuppliers).padEnd(23)}║
║  Medicines       : ${String(totalMedicines).padEnd(23)}║
║  Inv. Batches    : ${String(totalBatches).padEnd(23)}║
║  Expired Batches : ${String(expiredBatches).padEnd(23)}║
║  Stock Movements : ${String(totalMovements).padEnd(23)}║
║  Purchase Orders : ${String(totalOrders).padEnd(23)}║
║  Alerts (total)  : ${String(totalAlerts).padEnd(23)}║
║  Unresolved      : ${String(unresolvedAlerts).padEnd(23)}║
╚═══════════════════════════════════════════╝

  🔑 Admin login: anusha@medistock.com / Admin@123
`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
