import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { getMovements } from "@/lib/services/movements.service";
import { StockMovementDialog } from "@/components/app/StockMovementDialog";

export const Route = createFileRoute("/dashboard/movements")({
  head: () => ({ meta: [{ title: "Stock Movements · MediStock" }] }),
  component: MovementsPage,
});

function MovementsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["movements", page],
    queryFn: () => getMovements({ page, limit: 20 }),
  });

  const movements = data?.data ?? [];
  const total = data?.total ?? 0;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STOCK_IN":
      case "RETURNED":
        return "bg-mint-soft text-mint-foreground";
      case "ADJUSTMENT":
        return "bg-amber-soft text-amber border border-amber";
      case "STOCK_OUT":
        return "bg-danger-soft text-danger";
      case "EXPIRED":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Stock Movements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Audit trail of all inventory additions, reductions, and adjustments.</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Record Movement
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Medicine</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Batch No.</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Quantity</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Logged By</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date & Time</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ArrowLeftRight className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-medium text-base">No stock movements recorded yet</p>
                    <p className="text-xs max-w-xs">Use the "Record Movement" button above to log your first inventory adjustment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              movements.map((m: any) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{m.batch?.medicine?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{m.batch?.batchNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getTypeBadge(m.movementType)}`}>
                      {m.movementType.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${
                    m.movementType === "STOCK_IN" || m.movementType === "RETURNED" ? "text-mint-foreground" : "text-danger"
                  }`}>
                    {m.movementType === "STOCK_IN" || m.movementType === "RETURNED" ? "+" : "-"}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={m.notes}>
                    {m.notes ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <StockMovementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
