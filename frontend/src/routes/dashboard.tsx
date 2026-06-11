import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Search, Bell, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="ml-2 hidden text-sm text-muted-foreground md:block">
              <span className="text-foreground font-medium">Dashboard</span>
              <span className="mx-2">/</span>
              <span>Overview</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex">
                <Search className="h-3.5 w-3.5" />
                <input
                  className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search medicines, batches, suppliers…"
                />
              </div>
              <button
                onClick={() => qc.invalidateQueries()}
                title="Refresh"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-mint-soft text-sm font-semibold text-navy">
                {initials}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
