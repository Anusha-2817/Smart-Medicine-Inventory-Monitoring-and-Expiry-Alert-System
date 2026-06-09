export interface ValidationError {
  row: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Medicine Validator
// ---------------------------------------------------------------------------
export interface MedicineRow {
  Name: string;
  "Generic Name"?: string;
  Category?: string;
  Manufacturer?: string;
  SKU: string;
  "Prescription Required"?: string;
  "Reorder Threshold"?: string;
}

export function validateMedicineRows(
  rows: Record<string, string>[],
  existingSkus: Set<string>
): { valid: MedicineRow[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const valid: MedicineRow[] = [];
  const seenSkus = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed + header offset
    const rowErrors: string[] = [];

    const name = row["Name"]?.trim();
    const sku = row["SKU"]?.trim();
    const reorderStr = row["Reorder Threshold"]?.trim();

    if (!name) rowErrors.push("Name is required");
    if (!sku) {
      rowErrors.push("SKU is required");
    } else if (existingSkus.has(sku)) {
      rowErrors.push(`SKU '${sku}' already exists in database`);
    } else if (seenSkus.has(sku)) {
      rowErrors.push(`Duplicate SKU '${sku}' in file`);
    }

    const reorder = reorderStr ? parseInt(reorderStr, 10) : 50;
    if (reorderStr && (isNaN(reorder) || reorder < 0)) {
      rowErrors.push("Reorder Threshold must be a non-negative number");
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((msg) => errors.push({ row: rowNum, message: msg }));
    } else {
      if (sku) seenSkus.add(sku);
      valid.push(row as unknown as MedicineRow);
    }
  });

  return { valid, errors };
}

// ---------------------------------------------------------------------------
// Inventory Validator
// ---------------------------------------------------------------------------
export interface InventoryRow {
  "Medicine SKU": string;
  "Batch Number": string;
  Quantity: string;
  "Unit Cost": string;
  Supplier: string;
  "Manufacture Date"?: string;
  "Expiry Date": string;
}

export function validateInventoryRows(
  rows: Record<string, string>[],
  medicineSkuToId: Map<string, string>,
  supplierNameToId: Map<string, string>,
  existingBatches: Set<string> // "medicineId|batchNumber"
): { valid: InventoryRow[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const valid: InventoryRow[] = [];
  const seenBatches = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rowErrors: string[] = [];

    const sku = row["Medicine SKU"]?.trim();
    const batchNum = row["Batch Number"]?.trim();
    const quantityStr = row["Quantity"]?.trim();
    const costStr = row["Unit Cost"]?.trim();
    const supplierName = row["Supplier"]?.trim();
    const mfgDateStr = row["Manufacture Date"]?.trim();
    const expDateStr = row["Expiry Date"]?.trim();

    // Medicine SKU
    let medicineId: string | undefined;
    if (!sku) {
      rowErrors.push("Medicine SKU is required");
    } else {
      medicineId = medicineSkuToId.get(sku);
      if (!medicineId) rowErrors.push(`Medicine SKU '${sku}' not found in database`);
    }

    // Supplier
    let supplierId: string | undefined;
    if (!supplierName) {
      rowErrors.push("Supplier is required");
    } else {
      supplierId = supplierNameToId.get(supplierName.toLowerCase());
      if (!supplierId) rowErrors.push(`Supplier '${supplierName}' not found in database`);
    }

    // Batch number
    if (!batchNum) {
      rowErrors.push("Batch Number is required");
    } else if (medicineId) {
      const key = `${medicineId}|${batchNum}`;
      if (existingBatches.has(key)) {
        rowErrors.push(`Batch '${batchNum}' already exists for this medicine`);
      } else if (seenBatches.has(key)) {
        rowErrors.push(`Duplicate Batch Number '${batchNum}' in file`);
      } else {
        seenBatches.add(key);
      }
    }

    // Quantity
    const quantity = parseInt(quantityStr, 10);
    if (!quantityStr || isNaN(quantity) || quantity <= 0) {
      rowErrors.push("Quantity must be a positive integer");
    }

    // Unit Cost
    const cost = parseFloat(costStr);
    if (!costStr || isNaN(cost) || cost <= 0) {
      rowErrors.push("Unit Cost must be a positive number");
    }

    // Expiry Date
    if (!expDateStr) {
      rowErrors.push("Expiry Date is required");
    } else {
      const expDate = new Date(expDateStr);
      if (isNaN(expDate.getTime())) {
        rowErrors.push("Expiry Date is invalid (use YYYY-MM-DD)");
      } else if (mfgDateStr) {
        const mfgDate = new Date(mfgDateStr);
        if (!isNaN(mfgDate.getTime()) && expDate <= mfgDate) {
          rowErrors.push("Expiry Date must be after Manufacture Date");
        }
      }
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((msg) => errors.push({ row: rowNum, message: msg }));
    } else {
      valid.push(row as unknown as InventoryRow);
    }
  });

  return { valid, errors };
}

// ---------------------------------------------------------------------------
// Supplier Validator
// ---------------------------------------------------------------------------
export interface SupplierRow {
  "Supplier Name": string;
  "Contact Person"?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSupplierRows(
  rows: Record<string, string>[],
  existingNames: Set<string>
): { valid: SupplierRow[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const valid: SupplierRow[] = [];
  const seenNames = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rowErrors: string[] = [];

    const name = row["Supplier Name"]?.trim();
    const email = row["Email"]?.trim();

    if (!name) {
      rowErrors.push("Supplier Name is required");
    } else if (existingNames.has(name.toLowerCase())) {
      rowErrors.push(`Supplier '${name}' already exists in database`);
    } else if (seenNames.has(name.toLowerCase())) {
      rowErrors.push(`Duplicate Supplier Name '${name}' in file`);
    }

    if (email && !EMAIL_RE.test(email)) {
      rowErrors.push(`Email '${email}' is not a valid email address`);
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((msg) => errors.push({ row: rowNum, message: msg }));
    } else {
      if (name) seenNames.add(name.toLowerCase());
      valid.push(row as unknown as SupplierRow);
    }
  });

  return { valid, errors };
}
