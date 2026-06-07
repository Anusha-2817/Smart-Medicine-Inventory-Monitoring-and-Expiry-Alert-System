import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pill, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In · MediStock" },
      { name: "description", content: "Sign in to your MediStock pharmacy dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      // We could store a persistent flag based on rememberMe here if needed
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Split Layout */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-5">
        
        {/* Left Panel - Illustration (Hidden on mobile) */}
        <div className="relative hidden lg:col-span-2 lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground overflow-hidden">
          {/* Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-primary/20 bg-gradient-to-t from-primary to-transparent z-10" />
          
          <div className="relative z-20 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-md">
              <Pill className="h-6 w-6" />
            </span>
            <span className="font-semibold tracking-tight text-xl text-white">MediStock</span>
          </div>

          <div className="relative z-20 mt-auto">
            <h2 className="font-serif text-4xl tracking-tight leading-tight text-white mb-4">
              Smart Medicine Inventory Monitoring & Expiry Alert System
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Empowering pharmacies with seamless stock tracking, predictive alerts, and intelligent procurement.
            </p>
          </div>

          {/* Abstract background image from our generated illustration */}
          <img 
            src="/login-illustration.png" 
            alt="Pharmacy System Illustration" 
            className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>

        {/* Right Panel - Form */}
        <div className="flex flex-col items-center justify-center px-4 sm:px-12 lg:col-span-3 py-12">
          <div className="w-full max-w-sm">
            {/* Logo for Mobile */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Pill className="h-5 w-5" />
              </span>
              <span className="font-semibold tracking-tight text-lg">MediStock</span>
            </div>

            <h1 className="font-serif text-3xl tracking-tight">Welcome back.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your pharmacy dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="rememberMe" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <p className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Contact Admin Notice */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <a href="#" className="font-medium text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                Contact your system administrator
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
