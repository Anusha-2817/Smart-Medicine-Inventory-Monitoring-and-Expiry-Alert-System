import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser } from "@/lib/services/users.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserDialogProps {
  user: any | null; // Null if adding, user object if editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserDialog({ user, open, onOpenChange, onSuccess }: UserDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "PHARMACIST" | "STAFF">("STAFF");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setRole(user.role ?? "STAFF");
      setIsActive(user.isActive ?? true);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("STAFF");
      setIsActive(true);
      setPassword("");
    }
  }, [user, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("User name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const body: Record<string, any> = {
      name: name.trim(),
      email: email.trim(),
      role,
      isActive,
    };

    if (password) {
      body.password = password;
    } else if (!user) {
      body.password = "123456"; // Default password for new users if not specified
    }

    setLoading(true);
    try {
      if (user) {
        await updateUser(user.id, body);
        toast.success("User updated successfully!");
      } else {
        await createUser(body);
        toast.success("User created successfully!");
      }

      qc.invalidateQueries({ queryKey: ["users"] });
      
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-semibold">
            {user ? "Edit User Account" : "Add User Account"}
          </DialogTitle>
          <DialogDescription>
            {user ? "Update user profile role or account status." : "Create a new user account profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Full Name *
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Anusha Kumar"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email Address *
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. anusha@medistock.com"
              required
            />
          </div>

          {/* Role & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium text-foreground">
                Assign Role *
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="STAFF">Staff</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 h-10 mb-1">
                <input
                  id="user-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="user-active" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                  Account Active
                </label>
              </div>
            </div>
          </div>

          {/* Password (Optional for Edit) */}
          <div>
            <label htmlFor="user-pass" className="mb-1.5 block text-sm font-medium text-foreground">
              Password {user ? "(Optional)" : ""}
            </label>
            <input
              id="user-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={user ? "Leave blank to keep current" : "Default: 123456"}
              required={!user}
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
              {loading ? "Saving..." : user ? "Save Changes" : "Create User"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
