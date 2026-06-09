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
