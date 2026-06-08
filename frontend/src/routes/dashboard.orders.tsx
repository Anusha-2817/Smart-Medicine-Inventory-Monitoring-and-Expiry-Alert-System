import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { getOrders } from "@/lib/services/orders.service";
import { PurchaseOrderDialog } from "@/components/app/PurchaseOrderDialog";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · MediStock" }] }),
  component: OrdersPage,
});

const statusStyle: Record<string, string> = {
  DRAFT: "bg-secondary text-foreground",
  ORDERED: "bg-navy-soft text-primary-foreground",
  RECEIVED: "bg-mint-soft text-mint-foreground",
  CANCELLED: "bg-danger-soft text-danger",
};

function OrdersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });
  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.total ?? 0} orders total</p>
        </div>
        <button 
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supplier</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No purchase orders yet.</td></tr>
            ) : orders.map((o: any) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-medium">{o.supplier?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle[o.status] ?? "bg-secondary"}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.items?.length ?? 0} items</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PurchaseOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
