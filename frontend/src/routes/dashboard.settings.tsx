import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDemoStatus,
  generateDemoDataSync,
  type PharmacyMode,
  type DemoStatus,
} from "@/lib/services/demo.service";
import {
  Database,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Pill,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  Bell,
  Users,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings · MediStock" }] }),
  component: SettingsPage,
});

// ─── Demo Dataset Generator ────────────────────────────────────────────────────

type GenerateState = "idle" | "loading" | "success" | "error";

const PROFILE_OPTIONS: {
  id: PharmacyMode;
  label: string;
  description: string;
  medicines: number;
  batches: number;
  movements: number;
  orders: number;
}[] = [
  {
    id: "small",
    label: "Small Pharmacy",
    description: "Local community pharmacy with a focused formulary.",
    medicines: 35,
    batches: 90,
    movements: 250,
    orders: 18,
  },
  {
    id: "medium",
    label: "Medium Pharmacy",
    description: "Mid-size pharmacy or clinic dispensary.",
    medicines: 85,
    batches: 260,
    movements: 750,
    orders: 45,
  },
  {
    id: "hospital",
    label: "Hospital Inventory",
    description: "Full hospital pharmacy with broad formulary coverage.",
    medicines: 150,
    batches: 500,
    movements: 1500,
    orders: 80,
  },
];

function StatBadge({ icon: Icon, label, value, tone }: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone?: "danger" | "amber" | "mint" | "default";
}) {
  const colors = {
    danger: "text-red-500",
    amber: "text-amber-500",
    mint: "text-emerald-500",
    default: "text-foreground",
  };
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`ml-auto text-xs font-semibold tabular-nums ${colors[tone ?? "default"]}`}>{value.toLocaleString()}</span>
    </div>
  );
}

function DemoDatabaseStatus({ status }: { status: DemoStatus }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <StatBadge icon={Users}      label="Users"           value={status.users} />
      <StatBadge icon={Truck}      label="Suppliers"       value={status.suppliers} />
      <StatBadge icon={Pill}       label="Medicines"       value={status.medicines} />
      <StatBadge icon={Package}    label="Batches"         value={status.batches} />
      <StatBadge icon={Package}    label="Expired"         value={status.expiredBatches} tone="danger" />
      <StatBadge icon={ArrowLeftRight} label="Movements"   value={status.movements} />
      <StatBadge icon={ShoppingCart}   label="Orders"      value={status.orders} />
      <StatBadge icon={Bell}       label="Alerts"          value={status.alerts} />
      <StatBadge icon={AlertTriangle}  label="Unresolved"  value={status.unresolvedAlerts} tone="amber" />
    </div>
  );
}

function DemoDatasetPanel({ userRole }: { userRole: string }) {
  const [selectedMode, setSelectedMode] = useState<PharmacyMode>("medium");
  const [clearExisting, setClearExisting] = useState(false);
  const [state, setState] = useState<GenerateState>("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const { data: dbStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["demo-status"],
    queryFn: getDemoStatus,
    retry: false,
  });

  const handleGenerate = async () => {
    setState("loading");
    setError("");
    setResult(null);
    try {
      const res = await generateDemoDataSync(selectedMode, clearExisting);
      setResult(res);
      setState("success");
      // Invalidate all dashboard/reports queries so they refresh
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["report-summary"] });
      refetchStatus();
    } catch (e: any) {
      setError(e.message ?? "Generation failed.");
      setState("error");
    }
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
          <Database className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl leading-tight">Generate Demo Dataset</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Populate the database with realistic pharmacy inventory data
          </p>
        </div>
      </div>

      {/* Current DB status */}
      {dbStatus && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Current Database
          </p>
          <DemoDatabaseStatus status={dbStatus} />
        </div>
      )}

      {/* Profile selector */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-3">Select Pharmacy Profile</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROFILE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedMode(opt.id)}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                selectedMode === opt.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-secondary/40"
              }`}
            >
              {selectedMode === opt.id && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">{opt.description}</p>
              <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Medicines</span><span className="font-medium text-foreground">{opt.medicines}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batches</span><span className="font-medium text-foreground">{opt.batches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Movements</span><span className="font-medium text-foreground">{opt.movements}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orders</span><span className="font-medium text-foreground">{opt.orders}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Clear existing toggle */}
      <label className="mb-5 flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={clearExisting}
          onChange={(e) => setClearExisting(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
          id="clear-existing"
        />
        <div>
          <p className="text-sm font-medium group-hover:text-foreground transition-colors">
            Clear existing inventory before generation
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Removes all batches, movements, orders and alerts (users are preserved). Cannot be undone.
          </p>
        </div>
      </label>

      {/* Warning if clearExisting */}
      {clearExisting && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>All existing inventory data will be permanently deleted before new data is generated.</span>
        </div>
      )}

      {/* Result / Error feedback */}
      {state === "success" && result && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm mb-2">
            <CheckCircle2 className="h-4 w-4" />
            Dataset generated successfully!
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-emerald-700 dark:text-emerald-400">
            <span>Suppliers: <strong>{result.generated.suppliers}</strong></span>
            <span>Medicines: <strong>{result.generated.medicines}</strong></span>
            <span>Batches: <strong>{result.generated.batches}</strong></span>
            <span>Movements: <strong>{result.generated.movements}</strong></span>
            <span>Orders: <strong>{result.generated.purchaseOrders}</strong></span>
            <span>Alerts: <strong>{result.generated.alerts}</strong></span>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="inline h-4 w-4 mr-1.5" />
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={state === "loading"}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating data…
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            Generate {PROFILE_OPTIONS.find((o) => o.id === selectedMode)?.label} Dataset
          </>
        )}
      </button>
      {state === "loading" && (
        <p className="mt-2 text-xs text-muted-foreground">
          This may take 30–90 seconds depending on the profile size. Please wait…
        </p>
      )}
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────────

function SettingsPage() {
  const { user, token, updateUser } = useAuth();

  // Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: "", type: "" });
    setProfileLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (data.success) {
        updateUser(data.user);
        setProfileMsg({ text: "Profile updated successfully.", type: "success" });
      } else {
        setProfileMsg({ text: data.message || "Failed to update profile.", type: "error" });
      }
    } catch (err: any) {
      setProfileMsg({ text: "An error occurred while updating.", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ text: "", type: "" });

    if (password !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        setPassword("");
        setConfirmPassword("");
        setPasswordMsg({ text: "Password updated successfully.", type: "success" });
      } else {
        setPasswordMsg({ text: data.message || "Failed to update password.", type: "error" });
      }
    } catch (err: any) {
      setPasswordMsg({ text: "An error occurred while updating password.", type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Details Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl mb-4 border-b border-border pb-4">Profile Details</h2>

          {profileMsg.text && (
            <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${profileMsg.type === "success" ? "bg-mint-soft text-mint" : "bg-danger-soft text-danger"}`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl mb-4 border-b border-border pb-4">Change Password</h2>

          {passwordMsg.text && (
            <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${passwordMsg.type === "success" ? "bg-mint-soft text-mint" : "bg-danger-soft text-danger"}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-foreground">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Demo Dataset Generator — Admin only */}
        <DemoDatasetPanel userRole={user?.role ?? ""} />
      </div>
    </div>
  );
}
