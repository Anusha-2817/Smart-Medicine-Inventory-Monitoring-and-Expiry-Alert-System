import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/services/notifications.service";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications · MediStock" }] }),
  component: NotificationsPage,
});

const typeStyle: Record<string, string> = {
  CRITICAL: "bg-danger-soft text-danger",
  WARNING: "bg-amber-soft text-amber",
  INFO: "bg-secondary text-foreground",
};

function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  const read = useMutation({ mutationFn: markAsRead, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const readAll = useMutation({ mutationFn: markAllAsRead, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => readAll.mutate()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm hover:bg-secondary">
            Mark all as read
          </button>
        )}
      </div>
      <div className="mt-6 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">No notifications.</div>
        ) : notifications.map((n: any) => (
          <div key={n.id} onClick={() => !n.isRead && read.mutate(n.id)}
            className={`flex items-start gap-4 rounded-2xl border border-border p-5 cursor-pointer transition-colors ${n.isRead ? "bg-card opacity-60" : "bg-card hover:bg-secondary/30"}`}>
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${typeStyle[n.type] ?? "bg-secondary"}`}>
              <Bell className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{n.title}</span>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
