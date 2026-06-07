import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSuppliers } from "@/lib/services/suppliers.service";
import { getMedicines } from "@/lib/services/medicines.service";
import { createOrder } from "@/lib/services/orders.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface OrderItemInput {
  medicineId: string;
  orderedQuantity: string;
  unitPrice: string;
}

export function PurchaseOrderDialog({ open, onOpenChange, onSuccess }: PurchaseOrderDialogProps) {
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<OrderItemInput[]>([
    { medicineId: "", orderedQuantity: "", unitPrice: "" },
  ]);
  const [loading, setLoading] = useState(false);

  // Fetch suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ["all-suppliers-for-order"],
    queryFn: () => getSuppliers({ limit: 100 }),
    enabled: open,
  });

  // Fetch medicines
  const { data: medicinesData } = useQuery({
    queryKey: ["all-medicines-for-order"],
    queryFn: () => getMedicines({ limit: 100 }),
    enabled: open,
  });

  const suppliers = suppliersData?.data ?? [];
  const medicines = medicinesData?.data ?? [];

  const handleAddItem = () => {
    setItems([...items, { medicineId: "", orderedQuantity: "", unitPrice: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error("An order must have at least one item");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItemInput, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleClose = () => {
    setSupplierId("");
    setItems([{ medicineId: "", orderedQuantity: "", unitPrice: "" }]);
    onOpenChange(false);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = Number(item.orderedQuantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (items.some((item) => !item.medicineId)) {
      toast.error("Please select a medicine for all rows");
      return;
    }

    const parsedItems = items.map((item) => {
      const qty = Number(item.orderedQuantity);
      const price = Number(item.unitPrice);
      return {
        medicineId: item.medicineId,
        orderedQuantity: qty,
        unitPrice: price,
      };
    });

    if (parsedItems.some((item) => isNaN(item.orderedQuantity) || item.orderedQuantity <= 0)) {
      toast.error("Quantity must be a valid number greater than 0");
      return;
    }

    if (parsedItems.some((item) => isNaN(item.unitPrice) || item.unitPrice < 0)) {
      toast.error("Unit price must be a valid positive number");
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        supplierId,
        items: parsedItems,
      });

      toast.success("Purchase order created successfully!");
      qc.invalidateQueries({ queryKey: ["orders"] });
      
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create Purchase Order</DialogTitle>
          <DialogDescription>
            Draft a new purchase order requisition for a supplier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-5">
            {/* Supplier Select */}
            <div>
              <label htmlFor="order-supplier" className="mb-1.5 block text-sm font-medium text-foreground">
                Select Supplier *
              </label>
              <select
                id="order-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.contactPerson ?? "No contact"})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Order Items *</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Medicine
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-secondary/10 p-3 relative">
                    {/* Medicine */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Medicine</label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleItemChange(idx, "medicineId", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-primary"
                        required
                      >
                        <option value="">-- Select Medicine --</option>
                        {medicines.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.orderedQuantity}
                        onChange={(e) => handleItemChange(idx, "orderedQuantity", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-primary"
                        placeholder="Qty"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-28">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Unit Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-primary"
                        placeholder="Price"
                        required
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border text-danger hover:bg-danger-soft transition-colors self-end"
                      title="Remove Item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dialog Footer with Total cost */}
          <div className="border-t border-border mt-5 pt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Estimated Total:</span>
              <div className="font-serif text-xl font-semibold text-primary">
                ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Creating..." : "Create Draft Order"}
              </button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
