import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getDashboardStats } from "@/lib/services/dashboard.service";
import { kpis as mockKpis } from "@/lib/mock-dashboard";
import { KpiCard } from "@/components/app/KpiCard";
import { StockDistributionChart } from "@/components/app/StockDistributionChart";
import { ExpiryTrendChart } from "@/components/app/ExpiryTrendChart";
import { SupplierPieChart } from "@/components/app/SupplierPieChart";
import { RecentActivity } from "@/components/app/RecentActivity";
import { StockMovementDialog } from "@/components/app/StockMovementDialog";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard · MediStock" },
      { name: "description", content: "Live overview of pharmacy inventory: KPIs, stock distribution, expiry trend, supplier contribution, and recent activity." },
    ],
  }),
  component: DashboardPage,
});

const severityLegend = [
  { label: "SAFE", tint: "bg-mint text-mint-foreground", desc: "More than 90 days to expiry" },
  { label: "WARNING", tint: "bg-amber text-navy", desc: "30–90 days to expiry" },
  { label: "CRITICAL", tint: "bg-amber-soft text-amber border border-amber", desc: "Within 30 days" },
  { label: "EXPIRED", tint: "bg-danger text-primary-foreground", desc: "Past expiry — quarantined" },
];

function DashboardPage() {
  const { user } = useAuth();
  const [movementOpen, setMovementOpen] = useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: false,
  });

  // Build KPI cards from live data or fall back to mocks while loading
  const liveKpis = stats
    ? [
        { key: "medicines", label: "Total Medicines", value: stats.kpis.totalMedicines, delta: "Active SKUs", tone: "mint" as const, icon: "boxes" },
        { key: "batches", label: "Inventory Batches", value: stats.kpis.totalBatches, delta: "Active batches", tone: "navy" as const, icon: "layers" },
        { key: "low", label: "Low Stock Medicines", value: stats.kpis.lowStockMedicines, delta: "Reorder ready", tone: "amber" as const, icon: "trending-down" },
        { key: "exp30", label: "Expiring in 30 days", value: stats.kpis.expiringIn30Days, delta: "Check inventory", tone: "amber" as const, icon: "alert-triangle" },
        { key: "expired", label: "Expired", value: stats.kpis.expired, delta: "Quarantined", tone: "danger" as const, icon: "ban" },
        { key: "suppliers", label: "Total Suppliers", value: stats.kpis.totalSuppliers, delta: "Active suppliers", tone: "mint" as const, icon: "truck" },
      ]
    : mockKpis;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Good morning{user?.name ? `, ${user.name.split(' ')[0]}` : ""}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading dashboard…" : "Here's how the pharmacy is doing today."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/import-export" className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm hover:bg-secondary">
            Export report
          </Link>
          <button
            onClick={() => setMovementOpen(true)}
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            New stock movement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {liveKpis.map((k) => (
          <KpiCard key={k.key} label={k.label} value={k.value} delta={k.delta} tone={k.tone} icon={k.icon} />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StockDistributionChart data={stats?.stockDistribution} />
        <ExpiryTrendChart data={stats?.expiryTrend} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SupplierPieChart data={stats?.supplierContribution} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity data={stats?.recentActivity} />
        </div>
      </div>

      {/* Severity legend */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl">Expiry severity scale</h3>
            <p className="text-xs text-muted-foreground">How batches are classified across MediStock</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {severityLegend.map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.tint}`}>{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StockMovementDialog open={movementOpen} onOpenChange={setMovementOpen} />
    </div>
  );
}
