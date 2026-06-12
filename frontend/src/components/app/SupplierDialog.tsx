import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSupplier, updateSupplier } from "@/lib/services/suppliers.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SupplierDialogProps {
  supplier: any | null; // Null if adding, supplier object if editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SupplierDialog({ supplier, open, onOpenChange, onSuccess }: SupplierDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name ?? "");
      setContactPerson(supplier.contactPerson ?? "");
      setPhone(supplier.phone ?? "");
      setEmail(supplier.email ?? "");
      setAddress(supplier.address ?? "");
    } else {
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
  }, [supplier, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    const body: Record<string, any> = {
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    setLoading(true);
    try {
      if (supplier) {
        await updateSupplier(supplier.id, body);
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(body);
        toast.success("Supplier added successfully!");
      }

      qc.invalidateQueries({ queryKey: ["suppliers"] });
      
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-semibold">
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier ? "Update supplier details and contact info." : "Register a new supplier."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="sup-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Supplier Name *
            </label>
            <input
              id="sup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. PharmaCorp Inc."
              required
            />
          </div>

          <div>
            <label htmlFor="sup-contact" className="mb-1.5 block text-sm font-medium text-foreground">
              Contact Person
            </label>
            <input
              id="sup-contact"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sup-phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                id="sup-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
            <div>
              <label htmlFor="sup-email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="sup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. contact@supplier.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sup-address" className="mb-1.5 block text-sm font-medium text-foreground">
              Physical Address
            </label>
            <input
              id="sup-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 123 Industrial Way, City"
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
              {loading ? "Saving..." : supplier ? "Save Changes" : "Add Supplier"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
