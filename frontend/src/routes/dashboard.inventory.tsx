import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { getInventory } from "@/lib/services/inventory.service";

export const Route = createFileRoute("/dashboard/inventory")({
  head: () => ({ meta: [{ title: "Inventory · MediStock" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", search, page],
    queryFn: () => getInventory({ search, page, limit: 20 }),
  });

  const batches = data?.data ?? [];
  const total = data?.total ?? 0;

  const getExpiryStatus = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: "EXPIRED", tint: "bg-danger text-primary-foreground" };
    if (daysLeft <= 30) return { label: "CRITICAL", tint: "bg-amber-soft text-amber border border-amber" };
    if (daysLeft <= 90) return { label: "WARNING", tint: "bg-amber text-navy" };
    return { label: "SAFE", tint: "bg-mint-soft text-mint-foreground" };
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} batches tracked</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search by batch number or medicine name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Medicine</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Batch No.</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supplier</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit Cost</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expiry</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No inventory batches found.</td></tr>
            ) : batches.map((b: any) => {
              const expiry = getExpiryStatus(b.expiryDate);
              return (
                <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{b.medicine?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{b.batchNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3">{b.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{Number(b.unitCost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(b.expiryDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${expiry.tint}`}>{expiry.label}</span>
                  </td>
                </tr>
              );
            })}
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
    </div>
  );
}
