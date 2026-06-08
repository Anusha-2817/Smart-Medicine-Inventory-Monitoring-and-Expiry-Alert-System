import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings · MediStock" }] }),
  component: SettingsPage,
});

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
      </div>
    </div>
  );
}
