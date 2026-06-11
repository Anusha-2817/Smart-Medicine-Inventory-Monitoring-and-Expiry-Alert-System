import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, Package, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/services/orders.service";

interface Props {
  orderId: string | null;
  onClose: () => void;
}

const statusStyle: Record<string, string> = {
  DRAFT: "bg-secondary text-foreground",
  ORDERED: "bg-navy-soft text-primary-foreground",
  RECEIVED: "bg-mint-soft text-mint-foreground",
  CANCELLED: "bg-danger-soft text-danger",
};

export function PurchaseOrderDetailsDialog({ orderId, onClose }: Props) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });

  const totalCost = order?.items?.reduce((acc: number, item: any) => acc + (item.orderedQuantity * item.unitPrice), 0) || 0;

  return (
    <Dialog.Root open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background p-6 shadow-xl outline-none border border-border">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-serif text-2xl font-medium tracking-tight">
              Order Details
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {!order || isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading order details...</div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle[order.status] ?? "bg-secondary"}`}>
                    {order.status}
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3"/> Date</div>
                  <div className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Package className="h-3 w-3"/> Items</div>
                  <div className="text-sm font-medium">{order.items.length}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><IndianRupee className="h-3 w-3"/> Total</div>
                  <div className="text-sm font-medium text-primary">₹{totalCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-medium mb-3">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">Name</span>
                    <span className="font-medium">{order.supplier?.name}</span>
                  </div>
                  {order.supplier?.contactPerson && (
                    <div>
                      <span className="text-muted-foreground text-xs block">Contact</span>
                      <span>{order.supplier.contactPerson}</span>
                    </div>
                  )}
                  {order.supplier?.email && (
                    <div>
                      <span className="text-muted-foreground text-xs block">Email</span>
                      <span>{order.supplier.email}</span>
                    </div>
                  )}
                  {order.supplier?.phone && (
                    <div>
                      <span className="text-muted-foreground text-xs block">Phone</span>
                      <span>{order.supplier.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/40 text-muted-foreground text-xs border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Medicine</th>
                        <th className="px-4 py-3 font-medium">Qty</th>
                        <th className="px-4 py-3 font-medium">Unit Cost</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.medicine?.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.medicine?.sku}</div>
                          </td>
                          <td className="px-4 py-3">{item.orderedQuantity}</td>
                          <td className="px-4 py-3">₹{Number(item.unitPrice).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-medium text-primary">
                            ₹{(item.orderedQuantity * item.unitPrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
