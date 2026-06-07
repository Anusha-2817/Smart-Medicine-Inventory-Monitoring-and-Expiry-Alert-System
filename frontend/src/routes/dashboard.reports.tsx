import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Boxes,
  Calendar,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  Ban,
  FileSpreadsheet,
} from "lucide-react";
import { getReportSummary } from "@/lib/services/reports.service";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports · MediStock" }] }),
  component: ReportsPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const EXPIRY_COLORS = {
  safe: "#10b981",     // Safe - Emerald
  warning: "#f59e0b",  // Warning - Orange/Amber
  critical: "#ef4444", // Critical - Red
  expired: "#7f1d1d",  // Expired - Dark Red
};

function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "expiry" | "suppliers" | "movements">("inventory");

  const { data, isLoading } = useQuery({
    queryKey: ["report-summary"],
    queryFn: getReportSummary,
  });

  const downloadCSV = (type: string) => {
    const token = localStorage.getItem("medistock_token");
    const filename = `${type}_report.csv`;
    fetch(`/api/export/${type}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      });
  };

  const tabs = [
    { id: "inventory" as const, label: "Inventory Valuation", icon: Boxes },
    { id: "expiry" as const, label: "Expiry Timeline", icon: Calendar },
    { id: "suppliers" as const, label: "Supplier Contribution", icon: Truck },
    { id: "movements" as const, label: "Movement Volume", icon: ArrowLeftRight },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="font-serif text-4xl tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loading report statistics...</p>
        <div className="mt-12 text-center text-muted-foreground">Generating reports and charts…</div>
      </div>
    );
  }

  const inventory = data?.inventory ?? { totalSKUs: 0, totalStockQuantity: 0, totalStockValuation: 0, lowStockCount: 0, categoryBreakdown: [] };
  const expiry = data?.expiry ?? { expired: 0, critical: 0, warning: 0, safe: 0 };
  const suppliers = data?.suppliers ?? [];
  const movements = data?.movements ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live inventory metrics, expiry forecasts, and supplier analytics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV("inventory")}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-medium hover:bg-secondary transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Valuation CSV
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Valuation */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Valuation</span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-mint-foreground">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-semibold">
            ₹{Number(inventory.totalStockValuation).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Based on current unit costs</div>
        </div>

        {/* Total Stock Quantity */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Units in Stock</span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-soft text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-semibold">
            {Number(inventory.totalStockQuantity).toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Across {inventory.totalSKUs} unique medicine SKUs</div>
        </div>

        {/* Low Stock Items */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Stock SKUs</span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-soft text-amber">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-semibold text-amber">
            {inventory.lowStockCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Below reorder threshold</div>
        </div>

        {/* Expired Batches */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expired Batches</span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-danger-soft text-danger">
              <Ban className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-semibold text-danger">
            {expiry.expired}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Currently quarantined</div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="mt-8 flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === "inventory" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Category Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
              <div>
                <h3 className="font-serif text-xl">Category Distribution</h3>
                <p className="text-xs text-muted-foreground">Number of medicine catalog items grouped by category</p>
              </div>
              <div className="mt-6 h-80">
                {inventory.categoryBreakdown.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No category data found.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventory.categoryBreakdown} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]}>
                        {inventory.categoryBreakdown.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* General inventory stats */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl">Inventory Highlights</h3>
                <p className="text-xs text-muted-foreground">Quick key ratios for catalog inventory health</p>
              </div>
              <div className="mt-6 space-y-4 flex-1 justify-center flex flex-col">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Average SKU Valuation:</span>
                  <span className="font-medium text-sm">
                    ₹{inventory.totalSKUs > 0 ? (inventory.totalStockValuation / inventory.totalSKUs).toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Average Cost per Unit:</span>
                  <span className="font-medium text-sm">
                    ₹{inventory.totalStockQuantity > 0 ? (inventory.totalStockValuation / inventory.totalStockQuantity).toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Critical Reorder Alert Ratio:</span>
                  <span className="font-medium text-sm">
                    {inventory.totalSKUs > 0 ? ((inventory.lowStockCount / inventory.totalSKUs) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expiry" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Expiry Breakdown Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
              <div>
                <h3 className="font-serif text-xl">Expiry Risk Splits</h3>
                <p className="text-xs text-muted-foreground">Batches classified by remaining lifespan</p>
              </div>
              <div className="mt-6 h-80 flex items-center justify-center">
                {expiry.expired + expiry.critical + expiry.warning + expiry.safe === 0 ? (
                  <div className="text-xs text-muted-foreground">No expiry details found.</div>
                ) : (
                  <div className="flex items-center w-full h-full gap-8">
                    <div className="h-64 w-64 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Safe (> 90 days)", value: expiry.safe, color: EXPIRY_COLORS.safe },
                              { name: "Warning (30-90 days)", value: expiry.warning, color: EXPIRY_COLORS.warning },
                              { name: "Critical (< 30 days)", value: expiry.critical, color: EXPIRY_COLORS.critical },
                              { name: "Expired", value: expiry.expired, color: EXPIRY_COLORS.expired },
                            ]}
                            dataKey="value"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                          >
                            <Cell fill={EXPIRY_COLORS.safe} />
                            <Cell fill={EXPIRY_COLORS.warning} />
                            <Cell fill={EXPIRY_COLORS.critical} />
                            <Cell fill={EXPIRY_COLORS.expired} />
                          </Pie>
                          <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <ul className="flex-1 space-y-3.5 text-sm">
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: EXPIRY_COLORS.safe }} />
                          Safe (&gt; 90 days)
                        </span>
                        <span className="font-medium">{expiry.safe} batches</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: EXPIRY_COLORS.warning }} />
                          Warning (30-90 days)
                        </span>
                        <span className="font-medium">{expiry.warning} batches</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: EXPIRY_COLORS.critical }} />
                          Critical (&lt; 30 days)
                        </span>
                        <span className="font-medium text-amber">{expiry.critical} batches</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: EXPIRY_COLORS.expired }} />
                          Expired (Quarantined)
                        </span>
                        <span className="font-medium text-danger">{expiry.expired} batches</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Expiry quick action/text */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl">Lifespan Distribution</h3>
                <p className="text-xs text-muted-foreground">What the timeline forecast means</p>
              </div>
              <div className="mt-4 text-xs text-muted-foreground flex-1 flex flex-col justify-center space-y-3">
                <p>
                  <strong className="text-foreground">Critical & Expired</strong> products require immediate quarantine or return policies. Ensure these items are not available for sales orders.
                </p>
                <p>
                  <strong className="text-foreground">Warning</strong> items should be placed near front shelves to facilitate priority selling.
                </p>
                <p>
                  Cron jobs run daily to flag updates in batch statuses and alerts automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "suppliers" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-serif text-xl">Supplier Performance</h3>
              <p className="text-xs text-muted-foreground">Overview of quantity and valuation contribution by suppliers</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Supplier Name</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Active Batches</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Total Units Supplied</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Valuation (₹)</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Purchase Orders</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No suppliers found.</td></tr>
                ) : (
                  suppliers.map((s: any) => (
                    <tr key={s.supplierId} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-5 py-3 font-medium">{s.supplierName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{s.batchesCount}</td>
                      <td className="px-5 py-3">{s.totalQuantity} units</td>
                      <td className="px-5 py-3 font-semibold">₹{Number(s.totalValuation).toFixed(2)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{s.purchaseOrdersCount} POs</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "movements" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Movement Type Volume */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
              <div>
                <h3 className="font-serif text-xl">Movement Totals</h3>
                <p className="text-xs text-muted-foreground">Cumulative quantities moved by transaction types</p>
              </div>
              <div className="mt-6 h-80">
                {movements.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No stock movement history found.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={movements} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="movementType" tickFormatter={(v) => v.replace("_", " ")} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="totalQuantity" fill="var(--chart-3)" radius={[6, 6, 0, 0]}>
                        {movements.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* List breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl">Activity breakdown</h3>
                <p className="text-xs text-muted-foreground">Summary frequency of movements</p>
              </div>
              <div className="mt-6 flex-1 justify-center flex flex-col space-y-4">
                {movements.map((m: any) => (
                  <div key={m.movementType} className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">{m.movementType.replace("_", " ")}</span>
                    <span className="text-xs font-medium">{m.count} events logged</span>
                  </div>
                ))}
                {movements.length === 0 && <div className="text-xs text-muted-foreground text-center">No recent records.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
