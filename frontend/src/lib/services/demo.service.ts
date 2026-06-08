/**
 * demo.service.ts — Frontend API client for demo data generation
 */

export type PharmacyMode = "small" | "medium" | "hospital";

export interface DemoStatus {
  users: number;
  suppliers: number;
  medicines: number;
  batches: number;
  expiredBatches: number;
  movements: number;
  orders: number;
  alerts: number;
  unresolvedAlerts: number;
}

export interface DemoGenerateResult {
  mode: PharmacyMode;
  generated: {
    suppliers: number;
    users: number;
    medicines: number;
    batches: number;
    movements: number;
    purchaseOrders: number;
    alerts: number;
  };
}

function getToken(): string {
  return localStorage.getItem("medistock_token") ?? "";
}

export async function getDemoStatus(): Promise<DemoStatus> {
  const res = await fetch("/api/demo/status", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as DemoStatus;
}

export async function generateDemoDataSync(
  mode: PharmacyMode,
  clearExisting: boolean
): Promise<DemoGenerateResult> {
  const res = await fetch("/api/demo/generate-sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ mode, clearExisting }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as DemoGenerateResult;
}
