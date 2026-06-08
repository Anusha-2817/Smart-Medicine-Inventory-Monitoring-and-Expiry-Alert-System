import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory } from "@/lib/services/inventory.service";
import { createMovement } from "@/lib/services/movements.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StockMovementDialog({ open, onOpenChange, onSuccess }: StockMovementDialogProps) {
  const qc = useQueryClient();
  const [batchId, setBatchId] = useState("");
  const [movementType, setMovementType] = useState<"STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "EXPIRED" | "RETURNED">("STOCK_IN");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch batches to choose from
  const { data: inventoryData } = useQuery({
    queryKey: ["all-inventory-for-movement"],
    queryFn: () => getInventory({ limit: 100 }),
    enabled: open,
  });

  const batches = inventoryData?.data ?? [];

  const handleClose = () => {
    setBatchId("");
    setMovementType("STOCK_IN");
    setQuantity("");
    setNotes("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) {
      toast.error("Please select an inventory batch");
      return;
    }
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    setLoading(true);
    try {
      await createMovement({
        batchId,
        movementType,
        quantity: qtyNum,
        notes: notes || undefined,
      });

      toast.success("Stock movement recorded successfully!");
      
      // Invalidate queries so components showing dashboard stats and inventory/movement lists refresh
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["all-inventory-for-movement"] });
      
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to record stock movement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Record Stock Movement</DialogTitle>
          <DialogDescription>
            Record a change in inventory levels. This will immediately update the batch quantity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Batch Selection */}
          <div>
            <label htmlFor="batch" className="mb-1.5 block text-sm font-medium text-foreground">
              Select Batch
            </label>
            <select
              id="batch"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">-- Choose Batch --</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.medicine?.name ?? "Unknown Medicine"} (Batch: {b.batchNumber}, Stock: {b.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type & Quantity Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-foreground">
                Movement Type
              </label>
              <select
                id="type"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="STOCK_IN">Stock In (+)</option>
                <option value="STOCK_OUT">Stock Out (-)</option>
                <option value="RETURNED">Returned (+)</option>
                <option value="EXPIRED">Expired (-)</option>
                <option value="ADJUSTMENT">Adjustment (+/-)</option>
              </select>
            </div>

            <div>
              <label htmlFor="qty" className="mb-1.5 block text-sm font-medium text-foreground">
                Quantity
              </label>
              <input
                id="qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 50"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
              Notes / Remarks
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Reason for movement, order ref, etc."
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
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
              {loading ? "Recording..." : "Record Movement"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
