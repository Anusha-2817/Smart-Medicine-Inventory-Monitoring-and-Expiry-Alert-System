import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMedicine, updateMedicine } from "@/lib/services/medicines.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MedicineDialogProps {
  medicine: any | null; // Null if adding, object if editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MedicineDialog({ medicine, open, onOpenChange, onSuccess }: MedicineDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [sku, setSku] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [reorderThreshold, setReorderThreshold] = useState("50");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);

  // Sync state with medicine when it opens or edits
  useEffect(() => {
    if (medicine) {
      setName(medicine.name ?? "");
      setGenericName(medicine.genericName ?? "");
      setCategory(medicine.category ?? "");
      setManufacturer(medicine.manufacturer ?? "");
      setSku(medicine.sku ?? "");
      setRequiresPrescription(medicine.requiresPrescription ?? false);
      setReorderThreshold(String(medicine.reorderThreshold ?? 50));
      setStatus(medicine.status ?? "ACTIVE");
    } else {
      setName("");
      setGenericName("");
      setCategory("");
      setManufacturer("");
      // Generate a random SKU if blank
      setSku(`MED-${Math.floor(100 + Math.random() * 900)}`);
      setRequiresPrescription(false);
      setReorderThreshold("50");
      setStatus("ACTIVE");
    }
  }, [medicine, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    const body = {
      name: name.trim(),
      genericName: genericName.trim() || null,
      category: category.trim() || null,
      manufacturer: manufacturer.trim() || null,
      sku: sku.trim(),
      requiresPrescription,
      reorderThreshold: Number(reorderThreshold) || 0,
      status,
    };

    setLoading(true);
    try {
      if (medicine) {
        // Edit flow
        await updateMedicine(medicine.id, body);
        toast.success("Medicine updated successfully!");
      } else {
        // Add flow
        await createMedicine(body);
        toast.success("Medicine added successfully!");
      }

      // Refresh list
      qc.invalidateQueries({ queryKey: ["medicines"] });
      
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {medicine ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>
          <DialogDescription>
            {medicine
              ? "Update details for this medicine SKU."
              : "Create a new medicine product SKU in the master catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="med-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Medicine Name *
            </label>
            <input
              id="med-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Paracetamol 500mg"
              required
            />
          </div>

          {/* Generic Name */}
          <div>
            <label htmlFor="generic-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Generic Name / Active Ingredient
            </label>
            <input
              id="generic-name"
              type="text"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Acetaminophen"
            />
          </div>

          {/* SKU & Category Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-sku" className="mb-1.5 block text-sm font-medium text-foreground">
                SKU *
              </label>
              <input
                id="med-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. MED-001"
                required
              />
            </div>

            <div>
              <label htmlFor="med-category" className="mb-1.5 block text-sm font-medium text-foreground">
                Category
              </label>
              <input
                id="med-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Analgesic"
              />
            </div>
          </div>

          {/* Manufacturer & Reorder Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-manufacturer" className="mb-1.5 block text-sm font-medium text-foreground">
                Manufacturer
              </label>
              <input
                id="med-manufacturer"
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Sun Pharma"
              />
            </div>

            <div>
              <label htmlFor="med-threshold" className="mb-1.5 block text-sm font-medium text-foreground">
                Reorder Threshold
              </label>
              <input
                id="med-threshold"
                type="number"
                min="0"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 50"
              />
            </div>
          </div>

          {/* Status Select for edit */}
          {medicine && (
            <div>
              <label htmlFor="med-status" className="mb-1.5 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="med-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="ACTIVE">Active</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
          )}

          {/* Prescription checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              id="prescription"
              type="checkbox"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="prescription" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
              Requires prescription (Rx)
            </label>
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
              {loading ? "Saving..." : medicine ? "Save Changes" : "Add Medicine"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
