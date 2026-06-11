import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, resolveAlert, getAlertSummary, resolveBulkAlerts } from "@/lib/services/alerts.service";
import { AlertCircle, AlertTriangle, CheckCircle, Search, Info, CheckSquare, Square, Inbox } from "lucide-react";

export const Route = createFileRoute("/dashboard/alerts")({
  head: () => ({ meta: [{ title: "Alerts & Notifications · MediStock" }] }),
  component: AlertsPage,
});

const severityColors: Record<string, { bg: string; text: string; icon: any }> = {
  CRITICAL: { bg: "bg-danger/10", text: "text-danger", icon: AlertCircle },
  WARNING: { bg: "bg-amber/10", text: "text-amber", icon: AlertTriangle },
  INFO: { bg: "bg-blue-500/10", text: "text-blue-500", icon: Info },
};

function AlertsPage() {
  const qc = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("UNRESOLVED");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  // Queries
  const { data: summary } = useQuery({
    queryKey: ["alerts", "summary"],
    queryFn: getAlertSummary,
  });

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["alerts", { severityFilter, statusFilter, searchQuery }],
    queryFn: () => getAlerts({
      severity: severityFilter === "ALL" ? undefined : severityFilter,
      resolved: statusFilter === "ALL" ? undefined : statusFilter === "RESOLVED" ? "true" : "false",
      search: searchQuery || undefined,
    }),
  });

  // Mutations
  const resolve = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const resolveBulk = useMutation({
    mutationFn: resolveBulkAlerts,
    onSuccess: () => {
      setSelectedAlerts(new Set());
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const alerts = alertsData?.data ?? [];

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length && alerts.length > 0) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map((a: any) => a.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedAlerts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAlerts(newSet);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor inventory risks, expiry warnings, stock shortages, and operational issues.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["alerts"] })}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Refresh
          </button>
          {selectedAlerts.size > 0 && (
            <button
              onClick={() => resolveBulk.mutate(Array.from(selectedAlerts))}
              className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-medium text-mint-foreground hover:bg-mint/90 transition-colors shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              Resolve Selected ({selectedAlerts.size})
            </button>
          )}
        </div>
      </div>

      {/* ALERT HEALTH SUMMARY */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <button 
          onClick={() => { setStatusFilter("UNRESOLVED"); setSeverityFilter("ALL"); }}
          className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all hover:border-foreground/20 hover:bg-secondary/50 ${statusFilter === "UNRESOLVED" && severityFilter === "ALL" ? "border-foreground/20 bg-secondary" : "border-border bg-card"}`}
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unresolved</div>
          <div className="text-2xl font-serif">{summary?.unresolved ?? 0}</div>
        </button>

        <button 
          onClick={() => { setStatusFilter("UNRESOLVED"); setSeverityFilter("CRITICAL"); }}
          className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all hover:border-danger/20 hover:bg-danger/5 ${statusFilter === "UNRESOLVED" && severityFilter === "CRITICAL" ? "border-danger/30 bg-danger/5" : "border-border bg-card"}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-danger uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5" /> Critical
          </div>
          <div className="text-2xl font-serif text-danger">{summary?.critical ?? 0}</div>
        </button>

        <button 
          onClick={() => { setStatusFilter("UNRESOLVED"); setSeverityFilter("WARNING"); }}
          className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all hover:border-amber/20 hover:bg-amber/5 ${statusFilter === "UNRESOLVED" && severityFilter === "WARNING" ? "border-amber/30 bg-amber/5" : "border-border bg-card"}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" /> Warning
          </div>
          <div className="text-2xl font-serif text-amber">{summary?.warning ?? 0}</div>
        </button>

        <button 
          onClick={() => { setStatusFilter("RESOLVED"); setSeverityFilter("ALL"); }}
          className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all hover:border-mint/20 hover:bg-mint/5 ${statusFilter === "RESOLVED" ? "border-mint/30 bg-mint/5" : "border-border bg-card"}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-mint uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5" /> Resolved
          </div>
          <div className="text-2xl font-serif text-mint">{summary?.resolved ?? 0}</div>
        </button>
      </div>

      {/* QUICK FILTER BAR */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-2 shadow-sm">
        <div className="flex items-center gap-1 rounded-full bg-secondary/50 p-1">
          {["ALL", "CRITICAL", "WARNING", "INFO"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${severityFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s === "ALL" ? "All Severities" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-1 rounded-full bg-secondary/50 p-1">
          {["ALL", "UNRESOLVED", "RESOLVED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto relative w-64 max-w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Medicine / Batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-foreground/20"
          />
        </div>
      </div>

      {/* ALERTS TABLE */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="p-4 font-medium text-muted-foreground w-12">
                  <button onClick={handleSelectAll} className="flex text-muted-foreground hover:text-foreground">
                    {selectedAlerts.size === alerts.length && alerts.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Severity</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Alert & Medicine</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Batch</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Created At</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">Loading alerts...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint/10 text-mint">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl">No alerts found</h3>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        All inventory conditions match your current filters. Everything looks healthy!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                alerts.map((alert: any) => {
                  const sev = severityColors[alert.severity] || severityColors.INFO;
                  const Icon = sev.icon;
                  const isSelected = selectedAlerts.has(alert.id);

                  return (
                    <tr key={alert.id} className={`transition-colors hover:bg-secondary/30 ${isSelected ? "bg-secondary/50" : ""}`}>
                      <td className="p-4">
                        <button onClick={() => handleSelect(alert.id)} className="flex text-muted-foreground hover:text-foreground">
                          {isSelected ? <CheckSquare className="h-4 w-4 text-mint" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sev.bg} ${sev.text}`}>
                          <Icon className="h-3 w-3" />
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{alert.message}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {alert.alertType} • {alert.batch?.medicine?.name || "Unknown Medicine"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {alert.batch?.batchNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {alert.isResolved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-medium text-mint">
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-medium text-danger">
                            Unresolved
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!alert.isResolved && (
                          <button
                            onClick={() => resolve.mutate(alert.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
