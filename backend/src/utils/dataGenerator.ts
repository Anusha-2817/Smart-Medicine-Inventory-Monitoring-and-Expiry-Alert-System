/**
 * dataGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable, deterministic-style helpers to build realistic pharmacy inventory
 * data. All functions are pure (no DB calls) — they return plain objects that
 * callers can batch-insert via Prisma.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PharmacySize = "small" | "medium" | "hospital";

export interface DataProfile {
  medicines: number;
  batches: number;
  movements: number;
  orders: number;
  suppliers: number;
  users: number;
}

// ─── Size Profiles ────────────────────────────────────────────────────────────

export const DATA_PROFILES: Record<PharmacySize, DataProfile> = {
  small: {
    medicines: 35,
    batches: 90,
    movements: 250,
    orders: 18,
    suppliers: 7,
    users: 8,
  },
  medium: {
    medicines: 85,
    batches: 260,
    movements: 750,
    orders: 45,
    suppliers: 13,
    users: 16,
  },
  hospital: {
    medicines: 150,
    batches: 500,
    movements: 1500,
    orders: 80,
    suppliers: 20,
    users: 25,
  },
};

// ─── Core Helpers ─────────────────────────────────────────────────────────────

/** Random integer in [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float in [min, max] rounded to `decimals` places */
export function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/** Pick a random element from an array */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a random element with weights (weights need NOT sum to 1) */
export function weightedPick<T>(choices: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < choices.length; i++) {
    r -= weights[i];
    if (r <= 0) return choices[i];
  }
  return choices[choices.length - 1];
}

/** Random Date between two Date objects */
export function randDate(from: Date, to: Date): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

/** Add `days` days to a Date */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Add `months` months to a Date */
export function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

/** Abbreviate supplier/manufacturer name to 3-char code */
function supplierCode(name: string): string {
  return name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
}

// ─── Master Data Pools ────────────────────────────────────────────────────────

export const SUPPLIER_POOL = [
  { name: "Cipla Ltd",        contactPerson: "Amit Sharma",      phone: "+91-9988776655", email: "sales@cipla.com",            address: "Pune, Maharashtra" },
  { name: "Sun Pharma",       contactPerson: "Rajesh Kumar",     phone: "+91-9876543210", email: "procurement@sunpharma.com",  address: "Mumbai, Maharashtra" },
  { name: "Lupin Limited",    contactPerson: "Vikram Singh",     phone: "+91-9871234560", email: "contact@lupin.com",          address: "Mumbai, Maharashtra" },
  { name: "Dr. Reddy's",      contactPerson: "Priya Desai",      phone: "+91-9123456789", email: "orders@drreddys.com",        address: "Hyderabad, Telangana" },
  { name: "Mankind Pharma",   contactPerson: "Sandeep Gupta",    phone: "+91-9812345670", email: "supply@mankind.in",          address: "New Delhi, Delhi" },
  { name: "Torrent Pharma",   contactPerson: "Meena Patel",      phone: "+91-9756432109", email: "orders@torrentpharma.com",   address: "Ahmedabad, Gujarat" },
  { name: "Glenmark Pharma",  contactPerson: "Rohit Verma",      phone: "+91-9834567812", email: "procurement@glenmark.com",   address: "Mumbai, Maharashtra" },
  { name: "Alkem Laboratories",contactPerson:"Suresh Joshi",     phone: "+91-9823456701", email: "contact@alkem.com",          address: "Mumbai, Maharashtra" },
  { name: "Zydus Lifesciences",contactPerson:"Kavita Mehta",     phone: "+91-9768234510", email: "orders@zydus.com",           address: "Ahmedabad, Gujarat" },
  { name: "Abbott India",     contactPerson: "James Fernandez",  phone: "+91-9845671230", email: "india@abbott.com",           address: "Mumbai, Maharashtra" },
  { name: "Pfizer India",     contactPerson: "Anjali Nair",      phone: "+91-9867345612", email: "india@pfizer.com",           address: "Mumbai, Maharashtra" },
  { name: "GSK Pharma",       contactPerson: "Thomas Mathew",    phone: "+91-9856712340", email: "india@gsk.com",              address: "Bengaluru, Karnataka" },
  { name: "Novartis India",   contactPerson: "Deepa Krishnan",   phone: "+91-9834123456", email: "india@novartis.com",         address: "Mumbai, Maharashtra" },
  { name: "Sanofi India",     contactPerson: "Laurent Dupont",   phone: "+91-9712345678", email: "india@sanofi.com",           address: "Mumbai, Maharashtra" },
  { name: "AstraZeneca India",contactPerson: "Rachel D'Souza",   phone: "+91-9898765432", email: "india@astrazeneca.com",      address: "Bengaluru, Karnataka" },
  { name: "Wockhardt Ltd",    contactPerson: "Hamid Shaikh",     phone: "+91-9823401567", email: "orders@wockhardt.com",       address: "Mumbai, Maharashtra" },
  { name: "Cadila Healthcare",contactPerson: "Nisha Patel",      phone: "+91-9756123890", email: "supply@cadila.com",          address: "Ahmedabad, Gujarat" },
  { name: "Emcure Pharma",    contactPerson: "Arun Khanna",      phone: "+91-9812678345", email: "sales@emcure.com",           address: "Pune, Maharashtra" },
  { name: "Hetero Drugs",     contactPerson: "Venkata Rao",      phone: "+91-9867012345", email: "contact@heterodrugs.com",    address: "Hyderabad, Telangana" },
  { name: "Intas Pharma",     contactPerson: "Bhavesh Trivedi",  phone: "+91-9734512678", email: "orders@intaspharma.com",     address: "Ahmedabad, Gujarat" },
];

export const USER_POOL = [
  // Fixed admin always present
  { name: "Anusha Reddy",      email: "anusha@medistock.com",      role: "ADMIN",       pass: "Admin@123" },
  // Additional pool
  { name: "Dr. Ramesh Iyer",   email: "ramesh.iyer@medistock.com", role: "ADMIN",       pass: "Admin@456" },
  { name: "Priya Nambiar",     email: "priya.n@medistock.com",     role: "PHARMACIST",  pass: "Pharma@123" },
  { name: "Arjun Malhotra",    email: "arjun.m@medistock.com",     role: "PHARMACIST",  pass: "Pharma@456" },
  { name: "Sunita Verma",      email: "sunita.v@medistock.com",    role: "PHARMACIST",  pass: "Pharma@789" },
  { name: "Ravi Shankar",      email: "ravi.s@medistock.com",      role: "STAFF",       pass: "Staff@123" },
  { name: "Kavya Pillai",      email: "kavya.p@medistock.com",     role: "STAFF",       pass: "Staff@456" },
  { name: "Mohammed Farouk",   email: "farouk.m@medistock.com",    role: "STAFF",       pass: "Staff@789" },
  { name: "Ananya Singh",      email: "ananya.s@medistock.com",    role: "PHARMACIST",  pass: "Pharma@321" },
  { name: "Deepak Nair",       email: "deepak.n@medistock.com",    role: "STAFF",       pass: "Staff@321" },
  { name: "Lakshmi Bhat",      email: "lakshmi.b@medistock.com",   role: "PHARMACIST",  pass: "Pharma@654" },
  { name: "Suresh Menon",      email: "suresh.m@medistock.com",    role: "STAFF",       pass: "Staff@654" },
  { name: "Rekha Goswami",     email: "rekha.g@medistock.com",     role: "ADMIN",       pass: "Admin@789" },
  { name: "Vijay Prasad",      email: "vijay.p@medistock.com",     role: "STAFF",       pass: "Staff@987" },
  { name: "Shweta Agarwal",    email: "shweta.a@medistock.com",    role: "PHARMACIST",  pass: "Pharma@987" },
  { name: "Kiran Rao",         email: "kiran.r@medistock.com",     role: "STAFF",       pass: "Staff@111" },
  { name: "Pooja Shetty",      email: "pooja.sh@medistock.com",    role: "PHARMACIST",  pass: "Pharma@111" },
  { name: "Gaurav Chaudhary",  email: "gaurav.c@medistock.com",    role: "STAFF",       pass: "Staff@222" },
  { name: "Meena Krishnamurti",email: "meena.k@medistock.com",     role: "PHARMACIST",  pass: "Pharma@222" },
  { name: "Nitin Joshi",       email: "nitin.j@medistock.com",     role: "STAFF",       pass: "Staff@333" },
  { name: "Divya Menon",       email: "divya.m@medistock.com",     role: "ADMIN",       pass: "Admin@333" },
  { name: "Harish Patel",      email: "harish.p@medistock.com",    role: "STAFF",       pass: "Staff@444" },
  { name: "Sneha Kulkarni",    email: "sneha.k@medistock.com",     role: "PHARMACIST",  pass: "Pharma@444" },
  { name: "Aakash Mishra",     email: "aakash.m@medistock.com",    role: "STAFF",       pass: "Staff@555" },
  { name: "Rohini Desai",      email: "rohini.d@medistock.com",    role: "PHARMACIST",  pass: "Pharma@555" },
];

// ─── Medicine Master Data ─────────────────────────────────────────────────────

interface MedicineDef {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  requiresPrescription: boolean;
  reorderThreshold: number;
  unitCostRange: [number, number]; // helps generate realistic batch costs
}

export const MEDICINE_POOL: MedicineDef[] = [
  // ── Analgesics ──
  { name: "Paracetamol 500mg",      genericName: "Acetaminophen",         category: "Analgesic",       manufacturer: "Cipla Ltd",         requiresPrescription: false, reorderThreshold: 100, unitCostRange: [2, 8] },
  { name: "Paracetamol 650mg",      genericName: "Acetaminophen",         category: "Analgesic",       manufacturer: "Sun Pharma",        requiresPrescription: false, reorderThreshold: 80,  unitCostRange: [3, 10] },
  { name: "Tramadol 50mg",          genericName: "Tramadol HCl",          category: "Analgesic",       manufacturer: "Lupin Limited",     requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [12, 30] },
  { name: "Codeine 30mg",           genericName: "Codeine Phosphate",     category: "Analgesic",       manufacturer: "Dr. Reddy's",       requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [15, 45] },
  { name: "Diclofenac 50mg",        genericName: "Diclofenac Sodium",     category: "Analgesic",       manufacturer: "Mankind Pharma",    requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [4, 12] },
  { name: "Aspirin 75mg",           genericName: "Acetylsalicylic Acid",  category: "Analgesic",       manufacturer: "Bayer India",       requiresPrescription: false, reorderThreshold: 90,  unitCostRange: [2, 6] },

  // ── Antibiotics ──
  { name: "Amoxicillin 500mg",      genericName: "Amoxicillin",           category: "Antibiotic",      manufacturer: "Cipla Ltd",         requiresPrescription: true,  reorderThreshold: 50,  unitCostRange: [8, 20] },
  { name: "Azithromycin 250mg",     genericName: "Azithromycin",          category: "Antibiotic",      manufacturer: "Sun Pharma",        requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [12, 35] },
  { name: "Azithromycin 500mg",     genericName: "Azithromycin",          category: "Antibiotic",      manufacturer: "Lupin Limited",     requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [18, 45] },
  { name: "Ciprofloxacin 500mg",    genericName: "Ciprofloxacin HCl",     category: "Antibiotic",      manufacturer: "Dr. Reddy's",       requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [10, 28] },
  { name: "Doxycycline 100mg",      genericName: "Doxycycline Hyclate",   category: "Antibiotic",      manufacturer: "Alkem Laboratories",requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [8, 22] },
  { name: "Metronidazole 400mg",    genericName: "Metronidazole",         category: "Antibiotic",      manufacturer: "Abbott India",      requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [5, 15] },
  { name: "Cephalexin 500mg",       genericName: "Cephalexin",            category: "Antibiotic",      manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [12, 30] },
  { name: "Cefixime 200mg",         genericName: "Cefixime",              category: "Antibiotic",      manufacturer: "Glenmark Pharma",   requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [18, 50] },
  { name: "Levofloxacin 500mg",     genericName: "Levofloxacin",          category: "Antibiotic",      manufacturer: "Zydus Lifesciences",requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [20, 55] },
  { name: "Clarithromycin 500mg",   genericName: "Clarithromycin",        category: "Antibiotic",      manufacturer: "Wockhardt Ltd",     requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [25, 65] },
  { name: "Moxifloxacin 400mg",     genericName: "Moxifloxacin",          category: "Antibiotic",      manufacturer: "Bayer India",       requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [40, 95] },
  { name: "Ampicillin 500mg",       genericName: "Ampicillin",            category: "Antibiotic",      manufacturer: "Mankind Pharma",    requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [6, 18] },

  // ── Antidiabetics ──
  { name: "Metformin 500mg",        genericName: "Metformin HCl",         category: "Antidiabetic",    manufacturer: "Sun Pharma",        requiresPrescription: true,  reorderThreshold: 80,  unitCostRange: [4, 12] },
  { name: "Metformin 1000mg",       genericName: "Metformin HCl",         category: "Antidiabetic",    manufacturer: "Cipla Ltd",         requiresPrescription: true,  reorderThreshold: 60,  unitCostRange: [6, 18] },
  { name: "Glimepiride 2mg",        genericName: "Glimepiride",           category: "Antidiabetic",    manufacturer: "Sanofi India",      requiresPrescription: true,  reorderThreshold: 50,  unitCostRange: [10, 28] },
  { name: "Glibenclamide 5mg",      genericName: "Glibenclamide",         category: "Antidiabetic",    manufacturer: "Dr. Reddy's",       requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [5, 15] },
  { name: "Sitagliptin 100mg",      genericName: "Sitagliptin Phosphate", category: "Antidiabetic",    manufacturer: "Novartis India",    requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [55, 130] },
  { name: "Dapagliflozin 10mg",     genericName: "Dapagliflozin",         category: "Antidiabetic",    manufacturer: "AstraZeneca India", requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [75, 180] },
  { name: "Empagliflozin 10mg",     genericName: "Empagliflozin",         category: "Antidiabetic",    manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [80, 200] },
  { name: "Pioglitazone 15mg",      genericName: "Pioglitazone HCl",      category: "Antidiabetic",    manufacturer: "Lupin Limited",     requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [12, 32] },
  { name: "Voglibose 0.3mg",        genericName: "Voglibose",             category: "Antidiabetic",    manufacturer: "Glenmark Pharma",   requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [8, 22] },

  // ── Antihistamines ──
  { name: "Cetirizine 10mg",        genericName: "Cetirizine HCl",        category: "Antihistamine",   manufacturer: "Lupin Limited",     requiresPrescription: false, reorderThreshold: 70,  unitCostRange: [3, 9] },
  { name: "Levocetrizine 5mg",      genericName: "Levocetirizine HCl",    category: "Antihistamine",   manufacturer: "Abbott India",      requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [5, 14] },
  { name: "Fexofenadine 120mg",     genericName: "Fexofenadine HCl",      category: "Antihistamine",   manufacturer: "Sanofi India",      requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [8, 22] },
  { name: "Loratadine 10mg",        genericName: "Loratadine",            category: "Antihistamine",   manufacturer: "Emcure Pharma",     requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [4, 11] },
  { name: "Montelukast 10mg",       genericName: "Montelukast Sodium",    category: "Antihistamine",   manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [12, 35] },
  { name: "Chlorpheniramine 4mg",   genericName: "Chlorphenamine Maleate",category: "Antihistamine",   manufacturer: "Mankind Pharma",    requiresPrescription: false, reorderThreshold: 65,  unitCostRange: [2, 7] },
  { name: "Promethazine 25mg",      genericName: "Promethazine HCl",      category: "Antihistamine",   manufacturer: "Sanofi India",      requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [6, 18] },

  // ── Cardiovascular ──
  { name: "Atorvastatin 10mg",      genericName: "Atorvastatin Calcium",  category: "Cardiovascular",  manufacturer: "Lupin Limited",     requiresPrescription: true,  reorderThreshold: 60,  unitCostRange: [8, 22] },
  { name: "Atorvastatin 20mg",      genericName: "Atorvastatin Calcium",  category: "Cardiovascular",  manufacturer: "Dr. Reddy's",       requiresPrescription: true,  reorderThreshold: 50,  unitCostRange: [12, 32] },
  { name: "Rosuvastatin 10mg",      genericName: "Rosuvastatin Calcium",  category: "Cardiovascular",  manufacturer: "AstraZeneca India", requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [15, 40] },
  { name: "Amlodipine 5mg",         genericName: "Amlodipine Besylate",   category: "Cardiovascular",  manufacturer: "Pfizer India",      requiresPrescription: true,  reorderThreshold: 70,  unitCostRange: [5, 15] },
  { name: "Amlodipine 10mg",        genericName: "Amlodipine Besylate",   category: "Cardiovascular",  manufacturer: "Cipla Ltd",         requiresPrescription: true,  reorderThreshold: 55,  unitCostRange: [8, 22] },
  { name: "Telmisartan 40mg",       genericName: "Telmisartan",           category: "Cardiovascular",  manufacturer: "Glenmark Pharma",   requiresPrescription: true,  reorderThreshold: 60,  unitCostRange: [10, 28] },
  { name: "Telmisartan 80mg",       genericName: "Telmisartan",           category: "Cardiovascular",  manufacturer: "Mankind Pharma",    requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [14, 38] },
  { name: "Losartan 50mg",          genericName: "Losartan Potassium",    category: "Cardiovascular",  manufacturer: "Sun Pharma",        requiresPrescription: true,  reorderThreshold: 55,  unitCostRange: [8, 24] },
  { name: "Ramipril 5mg",           genericName: "Ramipril",              category: "Cardiovascular",  manufacturer: "Sanofi India",      requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [10, 30] },
  { name: "Carvedilol 6.25mg",      genericName: "Carvedilol",            category: "Cardiovascular",  manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [12, 32] },
  { name: "Metoprolol 50mg",        genericName: "Metoprolol Tartrate",   category: "Cardiovascular",  manufacturer: "AstraZeneca India", requiresPrescription: true,  reorderThreshold: 50,  unitCostRange: [6, 18] },
  { name: "Digoxin 0.25mg",         genericName: "Digoxin",               category: "Cardiovascular",  manufacturer: "GSK Pharma",        requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [5, 14] },
  { name: "Warfarin 5mg",           genericName: "Warfarin Sodium",       category: "Cardiovascular",  manufacturer: "Abbott India",      requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [8, 22] },
  { name: "Aspirin 150mg (Cardiac)",genericName: "Acetylsalicylic Acid",  category: "Cardiovascular",  manufacturer: "Bayer India",       requiresPrescription: false, reorderThreshold: 90,  unitCostRange: [3, 9] },
  { name: "Clopidogrel 75mg",       genericName: "Clopidogrel Bisulfate", category: "Cardiovascular",  manufacturer: "Sanofi India",      requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [18, 48] },

  // ── Gastrointestinal ──
  { name: "Omeprazole 20mg",        genericName: "Omeprazole",            category: "Gastrointestinal",manufacturer: "Dr. Reddy's",       requiresPrescription: false, reorderThreshold: 70,  unitCostRange: [5, 15] },
  { name: "Pantoprazole 40mg",      genericName: "Pantoprazole Sodium",   category: "Gastrointestinal",manufacturer: "Cipla Ltd",         requiresPrescription: false, reorderThreshold: 65,  unitCostRange: [6, 18] },
  { name: "Esomeprazole 40mg",      genericName: "Esomeprazole Magnesium",category: "Gastrointestinal",manufacturer: "AstraZeneca India", requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [10, 28] },
  { name: "Rabeprazole 20mg",       genericName: "Rabeprazole Sodium",    category: "Gastrointestinal",manufacturer: "Sun Pharma",        requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [8, 24] },
  { name: "Domperidone 10mg",       genericName: "Domperidone",           category: "Gastrointestinal",manufacturer: "Sanofi India",      requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [4, 12] },
  { name: "Metoclopramide 10mg",    genericName: "Metoclopramide HCl",    category: "Gastrointestinal",manufacturer: "Wockhardt Ltd",     requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [3, 9] },
  { name: "Ondansetron 4mg",        genericName: "Ondansetron HCl",       category: "Gastrointestinal",manufacturer: "GSK Pharma",        requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [8, 22] },
  { name: "Loperamide 2mg",         genericName: "Loperamide HCl",        category: "Gastrointestinal",manufacturer: "Hetero Drugs",      requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [3, 10] },
  { name: "Sucralfate 1g",          genericName: "Sucralfate",            category: "Gastrointestinal",manufacturer: "Alkem Laboratories",requiresPrescription: false, reorderThreshold: 40,  unitCostRange: [6, 18] },
  { name: "Lactulose 10g/15ml",     genericName: "Lactulose",             category: "Gastrointestinal",manufacturer: "Abbott India",      requiresPrescription: false, reorderThreshold: 30,  unitCostRange: [15, 40] },
  { name: "Bisacodyl 5mg",          genericName: "Bisacodyl",             category: "Gastrointestinal",manufacturer: "Emcure Pharma",     requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [3, 8] },
  { name: "Drotaverine 80mg",       genericName: "Drotaverine HCl",       category: "Gastrointestinal",manufacturer: "Sun Pharma",        requiresPrescription: false, reorderThreshold: 45,  unitCostRange: [4, 12] },

  // ── NSAIDs ──
  { name: "Ibuprofen 400mg",        genericName: "Ibuprofen",             category: "NSAID",           manufacturer: "Cipla Ltd",         requiresPrescription: false, reorderThreshold: 75,  unitCostRange: [4, 12] },
  { name: "Ibuprofen 600mg",        genericName: "Ibuprofen",             category: "NSAID",           manufacturer: "Mankind Pharma",    requiresPrescription: true,  reorderThreshold: 55,  unitCostRange: [6, 18] },
  { name: "Naproxen 250mg",         genericName: "Naproxen Sodium",       category: "NSAID",           manufacturer: "Roche India",       requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [5, 15] },
  { name: "Naproxen 500mg",         genericName: "Naproxen Sodium",       category: "NSAID",           manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [8, 22] },
  { name: "Piroxicam 20mg",         genericName: "Piroxicam",             category: "NSAID",           manufacturer: "Pfizer India",      requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [6, 16] },
  { name: "Mefenamic Acid 500mg",   genericName: "Mefenamic Acid",        category: "NSAID",           manufacturer: "Glenmark Pharma",   requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [4, 12] },
  { name: "Celecoxib 200mg",        genericName: "Celecoxib",             category: "NSAID",           manufacturer: "Pfizer India",      requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [15, 42] },
  { name: "Etoricoxib 60mg",        genericName: "Etoricoxib",            category: "NSAID",           manufacturer: "Sun Pharma",        requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [18, 48] },
  { name: "Ketorolac 10mg",         genericName: "Ketorolac Tromethamine",category: "NSAID",           manufacturer: "Hetero Drugs",      requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [10, 28] },

  // ── Antacids ──
  { name: "Antacid Syrup (Gelusil)",genericName: "Aluminium Hydroxide",   category: "Antacid",         manufacturer: "Pfizer India",      requiresPrescription: false, reorderThreshold: 30,  unitCostRange: [25, 70] },
  { name: "Ranitidine 150mg",       genericName: "Ranitidine HCl",        category: "Antacid",         manufacturer: "Cipla Ltd",         requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [4, 12] },
  { name: "Famotidine 20mg",        genericName: "Famotidine",            category: "Antacid",         manufacturer: "Alkem Laboratories",requiresPrescription: false, reorderThreshold: 45,  unitCostRange: [5, 14] },
  { name: "Cimetidine 400mg",       genericName: "Cimetidine",            category: "Antacid",         manufacturer: "Emcure Pharma",     requiresPrescription: false, reorderThreshold: 40,  unitCostRange: [4, 11] },
  { name: "Sodium Bicarbonate Tab", genericName: "Sodium Bicarbonate",    category: "Antacid",         manufacturer: "Hetero Drugs",      requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [2, 6] },

  // ── Supplements ──
  { name: "Vitamin D3 1000IU",      genericName: "Cholecalciferol",       category: "Supplement",      manufacturer: "Abbott India",      requiresPrescription: false, reorderThreshold: 60,  unitCostRange: [8, 22] },
  { name: "Vitamin D3 60000IU",     genericName: "Cholecalciferol",       category: "Supplement",      manufacturer: "Sun Pharma",        requiresPrescription: false, reorderThreshold: 40,  unitCostRange: [15, 40] },
  { name: "Vitamin B12 500mcg",     genericName: "Cyanocobalamin",        category: "Supplement",      manufacturer: "Lupin Limited",     requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [10, 28] },
  { name: "Calcium + Vitamin D3",   genericName: "Calcium Carbonate",     category: "Supplement",      manufacturer: "GSK Pharma",        requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [12, 32] },
  { name: "Iron + Folic Acid",      genericName: "Ferrous Sulphate",      category: "Supplement",      manufacturer: "Dr. Reddy's",       requiresPrescription: false, reorderThreshold: 70,  unitCostRange: [5, 16] },
  { name: "Zinc 50mg",              genericName: "Zinc Sulphate",         category: "Supplement",      manufacturer: "Alkem Laboratories",requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [4, 12] },
  { name: "Omega-3 1000mg",         genericName: "Fish Oil (EPA/DHA)",    category: "Supplement",      manufacturer: "Emcure Pharma",     requiresPrescription: false, reorderThreshold: 40,  unitCostRange: [15, 45] },
  { name: "Multivitamin (Revital H)",genericName:"Multivitamins",          category: "Supplement",      manufacturer: "Sanofi India",      requiresPrescription: false, reorderThreshold: 35,  unitCostRange: [20, 60] },
  { name: "Biotin 10mg",            genericName: "Biotin (Vitamin B7)",   category: "Supplement",      manufacturer: "Cadila Healthcare", requiresPrescription: false, reorderThreshold: 30,  unitCostRange: [8, 25] },
  { name: "Melatonin 5mg",          genericName: "Melatonin",             category: "Supplement",      manufacturer: "Intas Pharma",      requiresPrescription: false, reorderThreshold: 25,  unitCostRange: [12, 35] },
  { name: "Coenzyme Q10 100mg",     genericName: "Ubiquinone",            category: "Supplement",      manufacturer: "Pfizer India",      requiresPrescription: false, reorderThreshold: 20,  unitCostRange: [35, 90] },

  // ── Vaccines ──
  { name: "Hepatitis B Vaccine",    genericName: "HBsAg Vaccine",         category: "Vaccine",         manufacturer: "GSK Pharma",        requiresPrescription: true,  reorderThreshold: 10,  unitCostRange: [150, 350] },
  { name: "Influenza Vaccine",      genericName: "Inactivated Influenza", category: "Vaccine",         manufacturer: "Sanofi India",      requiresPrescription: true,  reorderThreshold: 10,  unitCostRange: [200, 500] },
  { name: "Typhoid Vaccine",        genericName: "Vi Polysaccharide",     category: "Vaccine",         manufacturer: "Novartis India",    requiresPrescription: true,  reorderThreshold: 8,   unitCostRange: [120, 300] },
  { name: "Pneumococcal Vaccine",   genericName: "PCV-13",                category: "Vaccine",         manufacturer: "Pfizer India",      requiresPrescription: true,  reorderThreshold: 5,   unitCostRange: [300, 700] },
  { name: "HPV Vaccine (Cervarix)", genericName: "HPV Bivalent",          category: "Vaccine",         manufacturer: "GSK Pharma",        requiresPrescription: true,  reorderThreshold: 5,   unitCostRange: [400, 800] },
  { name: "Rabies Vaccine",         genericName: "HDCV Rabies Vaccine",   category: "Vaccine",         manufacturer: "Novartis India",    requiresPrescription: true,  reorderThreshold: 5,   unitCostRange: [200, 450] },

  // ── Additional mixed ──
  { name: "Amlodipine+Olmesartan",  genericName: "Amlodipine+Olmesartan",category: "Cardiovascular",  manufacturer: "Torrent Pharma",    requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [18, 52] },
  { name: "Metformin+Glimepiride",  genericName: "Metformin+Glimepiride",category: "Antidiabetic",    manufacturer: "Sun Pharma",        requiresPrescription: true,  reorderThreshold: 45,  unitCostRange: [10, 28] },
  { name: "Paracetamol+Tramadol",   genericName: "Acetaminophen+Tramadol",category:"Analgesic",        manufacturer: "Mankind Pharma",    requiresPrescription: true,  reorderThreshold: 30,  unitCostRange: [12, 35] },
  { name: "Aceclofenac 100mg",      genericName: "Aceclofenac",           category: "NSAID",           manufacturer: "Intas Pharma",      requiresPrescription: false, reorderThreshold: 55,  unitCostRange: [5, 16] },
  { name: "Amoxiclav 625mg",        genericName: "Amoxicillin+Clavulanate",category:"Antibiotic",      manufacturer: "GSK Pharma",        requiresPrescription: true,  reorderThreshold: 35,  unitCostRange: [22, 60] },
  { name: "Piperacillin+Tazobactam",genericName: "Pip-Tazo 4.5g",         category: "Antibiotic",      manufacturer: "Wockhardt Ltd",     requiresPrescription: true,  reorderThreshold: 10,  unitCostRange: [120, 320] },
  { name: "Pantoprazole+Domperidone",genericName:"Pantoprazole+Domperidone",category:"Gastrointestinal",manufacturer:"Sun Pharma",         requiresPrescription: false, reorderThreshold: 50,  unitCostRange: [8, 22] },
  { name: "Vitamin C 500mg",        genericName: "Ascorbic Acid",         category: "Supplement",      manufacturer: "Emcure Pharma",     requiresPrescription: false, reorderThreshold: 65,  unitCostRange: [4, 12] },
  { name: "Folic Acid 5mg",         genericName: "Folic Acid",            category: "Supplement",      manufacturer: "Cadila Healthcare", requiresPrescription: false, reorderThreshold: 70,  unitCostRange: [3, 9] },
  { name: "Pregabalin 75mg",        genericName: "Pregabalin",            category: "Analgesic",       manufacturer: "Pfizer India",      requiresPrescription: true,  reorderThreshold: 25,  unitCostRange: [20, 55] },
  { name: "Gabapentin 300mg",       genericName: "Gabapentin",            category: "Analgesic",       manufacturer: "Intas Pharma",      requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [15, 42] },
  { name: "Pantoprazole Inj 40mg",  genericName: "Pantoprazole Sodium",   category: "Gastrointestinal",manufacturer: "Dr. Reddy's",       requiresPrescription: true,  reorderThreshold: 20,  unitCostRange: [25, 65] },
  { name: "Ondansetron Inj 4mg",    genericName: "Ondansetron HCl",       category: "Gastrointestinal",manufacturer: "Alkem Laboratories",requiresPrescription: true,  reorderThreshold: 15,  unitCostRange: [18, 48] },
  { name: "Normal Saline 500ml",    genericName: "Sodium Chloride 0.9%",  category: "Supplement",      manufacturer: "Baxter India",      requiresPrescription: true,  reorderThreshold: 50,  unitCostRange: [25, 60] },
  { name: "Dextrose 5% 500ml",      genericName: "Glucose 5%",            category: "Supplement",      manufacturer: "Baxter India",      requiresPrescription: true,  reorderThreshold: 40,  unitCostRange: [28, 65] },
];

// ─── Batch Expiry Distribution ─────────────────────────────────────────────────

export type ExpiryBucket =
  | "expired"       // 5%  — already expired
  | "critical7"     // 10% — within 7 days
  | "critical30"    // 15% — within 30 days
  | "warning90"     // 20% — within 90 days
  | "safe";         // 50% — > 90 days

export const EXPIRY_BUCKETS: ExpiryBucket[] = [
  "expired", "critical7", "critical30", "warning90", "safe",
];
export const EXPIRY_WEIGHTS = [5, 10, 15, 20, 50];

export function generateExpiryDate(now: Date): { expiryDate: Date; batchStatus: "ACTIVE" | "EXPIRED" } {
  const bucket = weightedPick<ExpiryBucket>(EXPIRY_BUCKETS, EXPIRY_WEIGHTS);
  let expiryDate: Date;
  let batchStatus: "ACTIVE" | "EXPIRED" = "ACTIVE";

  switch (bucket) {
    case "expired":
      // 1 day to 24 months in the past
      expiryDate = addDays(now, -randInt(1, 730));
      batchStatus = "EXPIRED";
      break;
    case "critical7":
      expiryDate = addDays(now, randInt(1, 7));
      break;
    case "critical30":
      expiryDate = addDays(now, randInt(8, 30));
      break;
    case "warning90":
      expiryDate = addDays(now, randInt(31, 90));
      break;
    case "safe":
    default:
      expiryDate = addDays(now, randInt(91, 730));
      break;
  }
  return { expiryDate, batchStatus };
}

/** Generate a realistic manufacturing date (6–36 months before expiry) */
export function generateManufacturingDate(expiryDate: Date): Date {
  const monthsBefore = randInt(6, 36);
  return addMonths(expiryDate, -monthsBefore);
}

/** Generate a batch number like BATCH-CIP-2026-1045 */
export function generateBatchNumber(supplierName: string, expiryDate: Date, seq: number): string {
  const code = supplierCode(supplierName);
  const year = expiryDate.getFullYear();
  const suffix = String(seq).padStart(4, "0");
  return `BATCH-${code}-${year}-${suffix}`;
}

/** Realistic quantity — biased towards 50–300, with tails at 5–1000 */
export function generateQuantity(): number {
  const r = Math.random();
  if (r < 0.05) return randInt(5, 15);          // very low stock
  if (r < 0.15) return randInt(16, 49);         // low stock
  if (r < 0.70) return randInt(50, 300);        // normal range
  if (r < 0.90) return randInt(301, 600);       // high stock
  return randInt(601, 1000);                    // overstock
}

// ─── Movement Notes ───────────────────────────────────────────────────────────

const STOCK_IN_NOTES = [
  "Received from supplier — PO fulfilled",
  "Quarterly replenishment stock received",
  "Emergency reorder — stock replenished",
  "Regular monthly delivery",
  "Replacement for short-shipped batch",
  "New consignment received and verified",
  "Bulk purchase — annual contract stock",
  "Stock received after QC clearance",
];

const STOCK_OUT_NOTES = [
  "Dispensed to outpatient — prescription verified",
  "Issued to ward — patient prescription",
  "Counter sale — OTC purchase",
  "Bulk dispense — hospital floor request",
  "Issued for clinical trial supply",
  "Dispensed on doctor's order",
  "Emergency dispense — ICU request",
  "Regular ward replenishment",
];

const ADJUSTMENT_NOTES = [
  "Cycle count variance — adjusted to actual",
  "Physical audit correction",
  "System discrepancy resolved",
  "Damaged packaging — quantity adjusted",
  "Annual stocktake adjustment",
  "Breakage during storage — adjusted",
  "Count reconciliation after stock audit",
];

const EXPIRED_NOTES = [
  "Batch quarantined — past expiry date",
  "Expired stock removed from active inventory",
  "Disposed per regulatory protocol",
  "Expired during cold chain failure",
  "End-of-shelf-life disposal",
];

const RETURNED_NOTES = [
  "Returned by patient — unused medication",
  "Supplier return — manufacturing defect",
  "Returned due to incorrect prescription",
  "Patient return — treatment discontinued",
  "Recalled batch returned to supplier",
];

const MOVEMENT_NOTE_MAP: Record<string, string[]> = {
  STOCK_IN:   STOCK_IN_NOTES,
  STOCK_OUT:  STOCK_OUT_NOTES,
  ADJUSTMENT: ADJUSTMENT_NOTES,
  EXPIRED:    EXPIRED_NOTES,
  RETURNED:   RETURNED_NOTES,
};

export function movementNote(type: string): string {
  return pick(MOVEMENT_NOTE_MAP[type] ?? ADJUSTMENT_NOTES);
}

/** Movement type distribution — realistic pharmacy: mostly STOCK_OUT, some STOCK_IN */
export const MOVEMENT_TYPES = ["STOCK_OUT", "STOCK_IN", "STOCK_OUT", "STOCK_OUT", "ADJUSTMENT", "RETURNED", "STOCK_OUT", "STOCK_IN", "EXPIRED", "STOCK_OUT"];

/** Realistic movement quantity — smaller for OUT, larger for IN */
export function movementQuantity(type: string): number {
  switch (type) {
    case "STOCK_IN":   return randInt(50, 300);
    case "STOCK_OUT":  return randInt(1, 30);
    case "ADJUSTMENT": return randInt(-20, 20) || 5;
    case "EXPIRED":    return randInt(5, 100);
    case "RETURNED":   return randInt(1, 15);
    default:           return randInt(1, 50);
  }
}

// ─── Purchase Order Notes ─────────────────────────────────────────────────────

export const PO_STATUS_WEIGHTS = {
  statuses:  ["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"] as const,
  weights:   [10, 25, 55, 10],
};
