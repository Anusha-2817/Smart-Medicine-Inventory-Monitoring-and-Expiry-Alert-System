import { recentActivity, type ActivityType } from "@/lib/mock-dashboard";
import { Plus, Minus, BellRing, PackagePlus, ClipboardList } from "lucide-react";

const meta: Record<string, { icon: typeof Plus; tint: string }> = {
  "Medicine Created": { icon: PackagePlus, tint: "bg-secondary text-foreground" },
  "Stock Added": { icon: Plus, tint: "bg-mint-soft text-mint-foreground" },
  "Stock Removed": { icon: Minus, tint: "bg-secondary text-foreground" },
  "Alert Generated": { icon: BellRing, tint: "bg-amber-soft text-amber" },
  "PO Created": { icon: ClipboardList, tint: "bg-mint-soft text-mint-foreground" },
  "STOCK_IN": { icon: Plus, tint: "bg-mint-soft text-mint-foreground" },
  "STOCK_OUT": { icon: Minus, tint: "bg-secondary text-foreground" },
  "ADJUSTMENT": { icon: ClipboardList, tint: "bg-secondary text-foreground" },
  "EXPIRED": { icon: BellRing, tint: "bg-amber-soft text-amber" },
  "RETURNED": { icon: PackagePlus, tint: "bg-mint-soft text-mint-foreground" },
};

interface LiveActivity { type: string; text: string; who: string; time: string; }
interface Props { data?: LiveActivity[]; }

export function RecentActivity({ data }: Props) {
  const activities = data ?? recentActivity;
  const formatTime = (time: string) => {
    if (!time.includes("T")) return time;
    const diff = Date.now() - new Date(time).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Recent activity</h3>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
      </div>
      <ul className="mt-4 space-y-4">
        {activities.map((a, i) => {
          const m = meta[a.type] ?? meta["Stock Added"];
          const Icon = m.icon;
          return (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.tint}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{a.type}</span>
                  <span className="text-xs text-muted-foreground">· {formatTime(a.time)}</span>
                </div>
                <div className="text-sm">{a.text}</div>
                <div className="text-xs text-muted-foreground">{a.who}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
