import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, resolveAlert } from "@/lib/services/alerts.service";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/alerts")({
  head: () => ({ meta: [{ title: "Alerts · MediStock" }] }),
  component: AlertsPage,
});

const severityStyle: Record<string, string> = {
  CRITICAL: "bg-danger text-primary-foreground",
  WARNING: "bg-amber text-navy",
  INFO: "bg-secondary text-foreground",
};

function AlertsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["alerts", "unresolved"],
    queryFn: () => getAlerts({ resolved: "false" }),
  });

  const resolve = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const alerts = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} unresolved alerts</p>
      </div>
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading alerts…</p>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            No unresolved alerts. Everything looks good!
          </div>
        ) : alerts.map((a: any) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityStyle[a.severity] ?? "bg-secondary"}`}>
                {a.severity}
              </span>
              <div>
                <div className="text-sm font-medium">{a.message}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {a.alertType} · Batch: {a.batch?.batchNumber} · {a.batch?.medicine?.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("en-IN")}</div>
              </div>
            </div>
            <button
              onClick={() => resolve.mutate(a.id)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-secondary"
            >
              <CheckCircle className="h-3.5 w-3.5 text-mint" /> Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
