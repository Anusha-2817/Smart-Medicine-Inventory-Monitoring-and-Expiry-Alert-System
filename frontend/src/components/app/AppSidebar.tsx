import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Pill,
  Boxes,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  BellRing,
  Bell,
  FileSpreadsheet,
  FileBarChart,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Medicines", url: "/dashboard/medicines", icon: Pill },
  { title: "Inventory", url: "/dashboard/inventory", icon: Boxes },
  { title: "Stock Movements", url: "/dashboard/movements", icon: ArrowLeftRight },
  { title: "Inventory Audit", url: "/dashboard/audit", icon: ShieldCheck },
  { title: "Suppliers", url: "/dashboard/suppliers", icon: Truck },
  { title: "Purchase Orders", url: "/dashboard/orders", icon: ClipboardList },
];

const secondary = [
  { title: "Alerts", url: "/dashboard/alerts", icon: BellRing, badge: "" },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Import / Export", url: "/dashboard/import-export", icon: FileSpreadsheet },
  { title: "Reports", url: "/dashboard/reports", icon: FileBarChart },
];

const admin = [
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const role = user?.role;

  const mainItems = main.filter((item) => {
    if (item.title === "Inventory Audit" || item.title === "Suppliers") return role === "ADMIN";
    if (item.title === "Purchase Orders" || item.title === "Stock Movements")
      return role === "ADMIN" || role === "PHARMACIST";
    return true;
  });

  const secondaryItems = secondary.filter((item) => {
    if (item.title === "Import / Export") return role === "ADMIN";
    if (item.title === "Reports") return role === "ADMIN" || role === "PHARMACIST";
    return true;
  });

  const adminItems = admin.filter(() => role === "ADMIN");

  const renderGroup = (label: string, items: typeof secondary) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              item.url === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {"badge" in item && item.badge && (
                      <span className="ml-auto rounded-full bg-amber-soft px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Pill className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight">MediStock</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Operations", mainItems)}
        {renderGroup("Monitoring", secondaryItems)}
        {adminItems.length > 0 && renderGroup("Admin", adminItems)}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">v1.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}
