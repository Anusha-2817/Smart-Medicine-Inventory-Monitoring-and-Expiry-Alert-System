import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight, Download, RefreshCw, AlertTriangle, User, Pill, Truck, Activity } from "lucide-react";
import { getAuditSummary, getAuditAnalytics, getAuditAnomalies, getAuditMovements } from "@/lib/services/audit.service";
import { KpiCard } from "@/components/app/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard/audit")({
  head: () => ({ meta: [{ title: "Inventory Audit · MediStock" }] }),
  component: AuditPage,
});

function AuditPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [typeFilter, setTypeFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All Users");
  const [page, setPage] = useState(1);

  // Derive start/end dates based on dateRange (simplified)
  const getDates = () => {
    const end = new Date();
    const start = new Date();
    if (dateRange === "Today") start.setDate(start.getDate() - 1);
    else if (dateRange === "Last 7 Days") start.setDate(start.getDate() - 7);
    else if (dateRange === "Last 30 Days") start.setDate(start.getDate() - 30);
    else if (dateRange === "Last 90 Days") start.setDate(start.getDate() - 90);
    else start.setFullYear(2000); // All time
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const dates = getDates();

  const { data: summary, refetch: refetchSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["audit-summary", dateRange],
    queryFn: () => getAuditSummary(getDates()),
  });

  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["audit-analytics", dateRange],
    queryFn: () => getAuditAnalytics(getDates()),
  });

  const { data: anomalies, refetch: refetchAnomalies } = useQuery({
    queryKey: ["audit-anomalies"],
    queryFn: () => getAuditAnomalies(),
  });

  const { data: movementsData, refetch: refetchMovements, isLoading: movementsLoading } = useQuery({
    queryKey: ["audit-movements", dateRange, typeFilter, userFilter, page],
    queryFn: () => getAuditMovements({ ...getDates(), type: typeFilter, userId: userFilter, page, limit: 20 }),
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchAnalytics();
    refetchAnomalies();
    refetchMovements();
  };

  const handleExport = () => {
    if (!movementsData?.data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Medicine,Batch,Type,Quantity,User,Notes\n"
      + movementsData.data.map((m: any) => 
          `"${new Date(m.createdAt).toLocaleString()}","${m.batch.medicine.name}","${m.batch.batchNumber}","${m.movementType}","${m.quantity}","${m.user.name}","${m.notes || ''}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Inventory_Audit_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STOCK_IN": return "bg-mint-soft text-mint-foreground";
      case "RETURNED": return "bg-mint-soft text-mint-foreground";
      case "ADJUSTMENT": return "bg-amber-soft text-amber border border-amber";
      case "STOCK_OUT": return "bg-danger-soft text-danger";
      case "EXPIRED": return "bg-danger text-white";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Inventory Audit</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Track all inventory changes, user actions, stock adjustments, and operational anomalies for compliance and accountability.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-4 w-4" /> Export Audit Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total Movements"
          value={summary?.totalMovements || 0}
          delta="Across selected period"
          tone="navy"
          icon="arrow-left-right"
        />
        <KpiCard
          label="Stock In"
          value={summary?.stockIn || 0}
          delta="Incoming inventory"
          tone="mint"
          icon="file-plus"
        />
        <KpiCard
          label="Stock Out"
          value={summary?.stockOut || 0}
          delta="Outgoing/Dispensed"
          tone="danger"
          icon="trending-down"
        />
        <KpiCard
          label="Adjustments"
          value={summary?.adjustments || 0}
          delta="Manual corrections"
          tone="amber"
          icon="alert-triangle"
        />
        <KpiCard
          label="Returns"
          value={summary?.returns || 0}
          delta="Returned items"
          tone="mint"
          icon="rotate-ccw"
        />
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left Column: Analytics & Chart */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Analytics Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Most Active User</div>
                  <div className="font-medium">{analytics?.mostActiveUser?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{analytics?.mostActiveUser?.movements || 0} movements</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-mint-soft p-2">
                  <Pill className="h-5 w-5 text-mint-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Most Moved Medicine</div>
                  <div className="font-medium truncate max-w-[130px]">{analytics?.mostMovedMedicine?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{analytics?.mostMovedMedicine?.count || 0} transactions</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-soft p-2">
                  <Truck className="h-5 w-5 text-amber" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Top Supplier</div>
                  <div className="font-medium truncate max-w-[130px]">{analytics?.topSupplier?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{analytics?.topSupplier?.percentage || 0}% of inventory received</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-medium flex items-center gap-2 mb-6">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Movement Trend
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.movementTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Anomalies & Timeline */}
        <div className="flex flex-col gap-8">
          {/* Anomaly Detection */}
          <div className="rounded-2xl border border-danger/20 bg-card overflow-hidden">
            <div className="bg-danger-soft/50 px-5 py-4 border-b border-danger/10">
              <h3 className="font-medium text-danger-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Anomaly Detection
              </h3>
            </div>
            <div className="p-2">
              {anomalies && anomalies.length > 0 ? (
                <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto p-3">
                  {anomalies.map((anomaly: any) => (
                    <div key={anomaly.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{anomaly.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          anomaly.severity === 'Critical' ? 'bg-danger text-white' : 
                          anomaly.severity === 'Review Required' ? 'bg-amber-soft text-amber border border-amber' :
                          'bg-secondary text-muted-foreground'
                        }`}>{anomaly.severity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{anomaly.details}</p>
                      <div className="text-[10px] text-muted-foreground/60 mt-2">
                        {new Date(anomaly.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No recent anomalies detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="mt-8 rounded-2xl border border-border bg-card">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-5 border-b border-border bg-secondary/20">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>All</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURNED">Returned</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select 
            value={userFilter} 
            onChange={(e) => setUserFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>All Users</option>
            <option value="Admin">Admin</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Date & Time</th>
                <th className="px-5 py-3 text-left font-medium">Medicine</th>
                <th className="px-5 py-3 text-left font-medium">Batch</th>
                <th className="px-5 py-3 text-left font-medium">Movement Type</th>
                <th className="px-5 py-3 text-left font-medium">Quantity</th>
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">Reason/Notes</th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading audit logs...</td></tr>
              ) : !movementsData?.data || movementsData.data.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No records found matching filters.</td></tr>
              ) : (
                movementsData.data.map((m: any) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium">{m.batch.medicine.name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{m.batch.batchNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getTypeBadge(m.movementType)}`}>
                        {m.movementType.replace("_", " ")}
                      </span>
                    </td>
                    <td className={`px-5 py-3 font-semibold ${
                      ["STOCK_IN", "RETURNED"].includes(m.movementType) ? "text-mint-foreground" : "text-danger"
                    }`}>
                      {["STOCK_IN", "RETURNED"].includes(m.movementType) ? "+" : "-"}{m.quantity}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium">
                          {m.user.name.charAt(0)}
                        </div>
                        <span className="text-muted-foreground">{m.user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate" title={m.notes || ''}>
                      {m.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {movementsData?.total > 20 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, movementsData.total)} of {movementsData.total} entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={page * 20 >= movementsData.total} 
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
