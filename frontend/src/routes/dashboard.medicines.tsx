import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { getMedicines, deleteMedicine } from "@/lib/services/medicines.service";
import { MedicineDialog } from "@/components/app/MedicineDialog";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/medicines")({
  head: () => ({ meta: [{ title: "Medicines · MediStock" }] }),
  component: MedicinesPage,
});

function MedicinesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "PHARMACIST";

  const { data, isLoading } = useQuery({
    queryKey: ["medicines", search, page],
    queryFn: () => getMedicines({ search, page, limit: 20 }),
  });

  const del = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });

  const medicines = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Medicines</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} medicines in the system</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditTarget(null); setDialogOpen(true); }}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Medicine
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search by name, generic name, or SKU…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Generic Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rx</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No medicines found.</td></tr>
            ) : medicines.map((m: any) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.genericName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.category ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.sku}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.status === "ACTIVE" ? "bg-mint-soft text-mint-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.requiresPrescription ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  {canEdit && (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditTarget(m); setDialogOpen(true); }}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => del.mutate(m.id)} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-danger hover:bg-danger-soft"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
      <MedicineDialog medicine={editTarget} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
