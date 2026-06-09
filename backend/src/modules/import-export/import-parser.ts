import * as XLSX from "xlsx";
import fs from "fs";

/**
 * Parse a CSV or XLSX file into an array of objects.
 * The first row is treated as the header.
 * Returns: { headers: string[], rows: Record<string, string>[] }
 */
export function parseFile(filePath: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer", raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (!data || data.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = (data[0] as string[]).map((h) => String(h).trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i] as string[];
    // Skip completely empty rows
    const isBlank = row.every((cell) => String(cell).trim() === "");
    if (isBlank) continue;

    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = String(row[idx] ?? "").trim();
    });
    rows.push(obj);
  }

  return { headers, rows };
}

export function cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Non-critical cleanup failure
  }
}
