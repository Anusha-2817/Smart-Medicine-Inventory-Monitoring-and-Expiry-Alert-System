import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { getSuppliers, deleteSupplier } from "@/lib/services/suppliers.service";
import { SupplierDialog } from "@/components/app/SupplierDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · MediStock" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", search],
    queryFn: () => getSuppliers({ search }),
  });

  const del = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete supplier");
    }
  });

  const suppliers = data?.data ?? [];

  const handleAdd = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      del.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Suppliers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.total ?? 0} registered suppliers</p>
        </div>
        <button 
          onClick={handleAdd}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" 
          placeholder="Search suppliers…" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact Person</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No suppliers found.</td></tr>
            ) : suppliers.map((s: any) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.contactPerson ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(s)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-secondary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border text-danger hover:bg-danger-soft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <SupplierDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        supplier={editingSupplier} 
      />
    </div>
  );
}
