export const kpis = [
  { key: "medicines", label: "Total Medicines", value: 1250, delta: "+24 this week", tone: "mint" as const, icon: "boxes" },
  { key: "batches", label: "Inventory Batches", value: 3420, delta: "+86 this week", tone: "navy" as const, icon: "layers" },
  { key: "low", label: "Low Stock Medicines", value: 17, delta: "Reorder ready", tone: "amber" as const, icon: "trending-down" },
  { key: "exp30", label: "Expiring in 30 days", value: 45, delta: "3 critical", tone: "amber" as const, icon: "alert-triangle" },
  { key: "expired", label: "Expired", value: 8, delta: "Quarantined", tone: "danger" as const, icon: "ban" },
  { key: "suppliers", label: "Total Suppliers", value: 32, delta: "2 new", tone: "mint" as const, icon: "truck" },
];

export const stockDistribution = [
  { name: "Paracetamol", qty: 500 },
  { name: "Amoxicillin", qty: 250 },
  { name: "Cetirizine", qty: 300 },
  { name: "Vitamin D3", qty: 180 },
  { name: "Ibuprofen", qty: 410 },
  { name: "Metformin", qty: 220 },
  { name: "Omeprazole", qty: 140 },
  { name: "Azithromycin", qty: 95 },
];

export const expiryTrend = [
  { month: "Jun", count: 5 },
  { month: "Jul", count: 8 },
  { month: "Aug", count: 12 },
  { month: "Sep", count: 9 },
  { month: "Oct", count: 14 },
  { month: "Nov", count: 6 },
];

export const supplierContribution = [
  { name: "Sun Pharma", value: 34 },
  { name: "Cipla", value: 26 },
  { name: "Lupin", value: 18 },
  { name: "Dr. Reddy's", value: 14 },
  { name: "Others", value: 8 },
];

export type ActivityType = "Medicine Created" | "Stock Added" | "Stock Removed" | "Alert Generated" | "PO Created";

export const recentActivity: { type: ActivityType; text: string; who: string; time: string }[] = [
  { type: "Alert Generated", text: "Amoxicillin 500mg batch A-2231 expires in 6 days", who: "System", time: "2m ago" },
  { type: "Stock Added", text: "+120 Paracetamol 650mg via PO-1142", who: "Riya Sharma", time: "18m ago" },
  { type: "Stock Removed", text: "-8 Amoxicillin 500mg (OTC sale)", who: "Counter 2", time: "42m ago" },
  { type: "Medicine Created", text: "New SKU added: Pantoprazole 40mg", who: "Vikram Rao", time: "1h ago" },
  { type: "PO Created", text: "Purchase order PO-1148 sent to Cipla", who: "Aditi Menon", time: "3h ago" },
  { type: "Alert Generated", text: "Low stock — Cetirizine 10mg below threshold", who: "System", time: "5h ago" },
];
