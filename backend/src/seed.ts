import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Users
  const users = [
    { name: "Anusha (Admin)", email: "anusha@gmail.com", role: "ADMIN", pass: "123456" },
    { name: "John Doe (Admin)", email: "john@medistock.com", role: "ADMIN", pass: "admin123" },
    { name: "Sarah Smith (Manager)", email: "sarah@medistock.com", role: "ADMIN", pass: "admin123" },
    { name: "Mike Johnson (Pharmacist)", email: "mike@medistock.com", role: "PHARMACIST", pass: "pharma123" },
    { name: "Emma Davis (Staff)", email: "emma@medistock.com", role: "STAFF", pass: "staff123" },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hash = await bcrypt.hash(u.pass, 10);
      await prisma.user.create({
        data: { name: u.name, email: u.email, password_hash: hash, role: u.role as any },
      });
      console.log(`✅ Created user: ${u.email} / ${u.pass}`);
    } else {
      console.log(`ℹ️  User already exists: ${u.email}`);
    }
  }

  // 2. Create Suppliers
  const suppliers = [
    { name: "Sun Pharma", contactPerson: "Rajesh Kumar", phone: "+91-9876543210", email: "procurement@sunpharma.com", address: "Mumbai, Maharashtra" },
    { name: "Cipla Ltd", contactPerson: "Amit Sharma", phone: "+91-9988776655", email: "sales@cipla.com", address: "Pune, Maharashtra" },
    { name: "Dr. Reddy's", contactPerson: "Priya Desai", phone: "+91-9123456789", email: "orders@drreddys.com", address: "Hyderabad, Telangana" },
    { name: "Lupin Limited", contactPerson: "Vikram Singh", phone: "+91-9871234560", email: "contact@lupin.com", address: "Mumbai, Maharashtra" },
  ];

  const createdSuppliers = [];
  for (const s of suppliers) {
    let supplier = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: s });
      console.log(`✅ Created demo supplier: ${s.name}`);
    }
    createdSuppliers.push(supplier);
  }

  // 3. Create Medicines
  const medicineDefs = [
    { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Analgesic", sku: "MED-001", manufacturer: "Sun Pharma" },
    { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotic", sku: "MED-002", manufacturer: "Cipla", requiresPrescription: true },
    { name: "Cetirizine 10mg", genericName: "Cetirizine HCL", category: "Antihistamine", sku: "MED-003", manufacturer: "Lupin" },
    { name: "Vitamin D3 1000IU", genericName: "Cholecalciferol", category: "Supplement", sku: "MED-004", manufacturer: "Dr. Reddy's" },
    { name: "Metformin 500mg", genericName: "Metformin HCL", category: "Antidiabetic", sku: "MED-005", manufacturer: "Sun Pharma", requiresPrescription: true },
    { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "NSAID", sku: "MED-006", manufacturer: "Cipla", requiresPrescription: true },
    { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Antacid", sku: "MED-007", manufacturer: "Dr. Reddy's", requiresPrescription: true },
    { name: "Atorvastatin 10mg", genericName: "Atorvastatin", category: "Statin", sku: "MED-008", manufacturer: "Lupin", requiresPrescription: true },
    { name: "Azithromycin 250mg", genericName: "Azithromycin", category: "Antibiotic", sku: "MED-009", manufacturer: "Sun Pharma", requiresPrescription: true },
    { name: "Pantoprazole 40mg", genericName: "Pantoprazole", category: "Antacid", sku: "MED-010", manufacturer: "Cipla", requiresPrescription: true },
  ];

  for (let i = 0; i < medicineDefs.length; i++) {
    const med = medicineDefs[i];
    const exists = await prisma.medicine.findUnique({ where: { sku: med.sku } });
    if (!exists) {
      const medicine = await prisma.medicine.create({ data: med });

      // Assign a random supplier from the ones we created
      const supplier = createdSuppliers[i % createdSuppliers.length];

      // Create a batch with some randomized quantities and expiry
      const expiryDate = new Date();
      // Random expiry between 1 to 12 months
      const monthsToAdd = Math.floor(Math.random() * 12) + 1;
      expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

      await prisma.inventoryBatch.create({
        data: {
          medicineId: medicine.id,
          supplierId: supplier.id,
          batchNumber: `BATCH-${med.sku}-${Math.floor(1000 + Math.random() * 9000)}`,
          quantity: Math.floor(50 + Math.random() * 450), // 50 to 500
          unitCost: Math.floor(2 + Math.random() * 20),
          expiryDate,
        },
      });
      console.log(`✅ Created medicine + batch: ${med.name}`);
    }
  }

  // 4. Create sample alerts
  const batches = await prisma.inventoryBatch.findMany({ take: 3 });
  for (const batch of batches) {
    const alertExists = await prisma.alert.findFirst({ where: { batchId: batch.id } });
    if (!alertExists) {
      await prisma.alert.create({
        data: {
          batchId: batch.id,
          alertType: "LOW_STOCK",
          severity: "WARNING",
          message: `${batch.batchNumber} stock might require reordering soon.`,
        },
      });
      console.log(`✅ Created demo alert for ${batch.batchNumber}`);
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
