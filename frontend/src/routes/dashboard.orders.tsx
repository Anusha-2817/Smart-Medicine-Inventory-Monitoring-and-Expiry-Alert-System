import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, MoreHorizontal, Eye, CheckCircle, XCircle, Send, AlertTriangle } from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/services/orders.service";
import { PurchaseOrderDialog } from "@/components/app/PurchaseOrderDialog";
import { PurchaseOrderDetailsDialog } from "@/components/app/PurchaseOrderDetailsDialog";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · MediStock" }] }),
  component: OrdersPage,
});

const statusStyle: Record<string, string> = {
  DRAFT: "bg-secondary text-foreground",
  ORDERED: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  RECEIVED: "bg-mint/10 text-mint border border-mint/20",
  CANCELLED: "bg-danger/10 text-danger border border-danger/20",
};

type ConfirmAction = {
  orderId: string;
  targetStatus: string;
  title: string;
  description: string;
  confirmText: string;
} | null;

function OrdersPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "PHARMACIST";

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setConfirmAction(null);
    },
  });

  const orders = data?.data ?? [];

  const handleAction = (orderId: string, action: string) => {
    setActionMenuOpen(null);
    if (action === "VIEW") {
      setDetailsOrderId(orderId);
    } else if (action === "PLACE") {
      setConfirmAction({
        orderId,
        targetStatus: "ORDERED",
        title: "Place Order",
        description: "Are you sure you want to place this order? This will transition the order from DRAFT to ORDERED.",
        confirmText: "Place Order",
      });
    } else if (action === "RECEIVE") {
      setConfirmAction({
        orderId,
        targetStatus: "RECEIVED",
        title: "Mark as Received?",
        description: "This will automatically create new inventory batches for all items, update stock quantities, and log STOCK_IN movements in the audit trail. This action cannot be undone.",
        confirmText: "Receive Order",
      });
    } else if (action === "CANCEL") {
      setConfirmAction({
        orderId,
        targetStatus: "CANCELLED",
        title: "Cancel Purchase Order?",
        description: "Are you sure you want to cancel this order? This action cannot be undone.",
        confirmText: "Cancel Order",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.total ?? 0} orders total</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Order
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 font-medium text-muted-foreground">Order ID</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Supplier</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No purchase orders yet.</td></tr>
            ) : orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 font-medium">{o.supplier?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${statusStyle[o.status] ?? "bg-secondary"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.items?.length ?? 0} items</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === o.id ? null : o.id)}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {actionMenuOpen === o.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActionMenuOpen(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 origin-top-right rounded-xl border border-border bg-card shadow-lg outline-none overflow-hidden py-1">
                          {canEdit && o.status === "DRAFT" && (
                            <>
                              <button onClick={() => handleAction(o.id, "PLACE")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left">
                                <Send className="h-4 w-4 text-blue-500" /> Place Order
                              </button>
                              <button onClick={() => handleAction(o.id, "CANCEL")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left text-danger">
                                <XCircle className="h-4 w-4" /> Cancel
                              </button>
                            </>
                          )}
                          {canEdit && o.status === "ORDERED" && (
                            <>
                              <button onClick={() => handleAction(o.id, "RECEIVE")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left text-mint">
                                <CheckCircle className="h-4 w-4" /> Receive Order
                              </button>
                              <button onClick={() => handleAction(o.id, "CANCEL")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left text-danger">
                                <XCircle className="h-4 w-4" /> Cancel
                              </button>
                            </>
                          )}
                          {(o.status === "RECEIVED" || o.status === "CANCELLED") && (
                            <button onClick={() => handleAction(o.id, "VIEW")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left">
                              <Eye className="h-4 w-4" /> View Details
                            </button>
                          )}
                          {(o.status === "DRAFT" || o.status === "ORDERED") && (
                            <button onClick={() => handleAction(o.id, "VIEW")} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-secondary text-left border-t border-border mt-1 pt-2">
                              <Eye className="h-4 w-4" /> View Details
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <PurchaseOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <PurchaseOrderDetailsDialog orderId={detailsOrderId} onClose={() => setDetailsOrderId(null)} />

      {/* Confirmation Dialog */}
      <Dialog.Root open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl outline-none border border-border">
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 rounded-full p-2 ${confirmAction?.targetStatus === "CANCELLED" ? "bg-danger/10 text-danger" : confirmAction?.targetStatus === "RECEIVED" ? "bg-mint/10 text-mint" : "bg-primary/10 text-primary"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Dialog.Title className="font-serif text-xl font-medium">{confirmAction?.title}</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {confirmAction?.description}
                </Dialog.Description>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50" disabled={updateStatus.isPending}>
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => confirmAction && updateStatus.mutate({ id: confirmAction.orderId, status: confirmAction.targetStatus })}
                disabled={updateStatus.isPending}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  confirmAction?.targetStatus === "CANCELLED" ? "bg-danger hover:bg-danger/90" : 
                  confirmAction?.targetStatus === "RECEIVED" ? "bg-mint hover:bg-mint/90" : 
                  "bg-primary hover:bg-primary/90"
                }`}
              >
                {updateStatus.isPending ? "Processing..." : confirmAction?.confirmText}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}

