import { Boxes, Layers, TrendingDown, TrendingUp, AlertTriangle, Ban, Truck, ArrowLeftRight, RotateCcw, FilePlus, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  boxes: Boxes,
  layers: Layers,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  ban: Ban,
  truck: Truck,
  "arrow-left-right": ArrowLeftRight,
  "rotate-ccw": RotateCcw,
  "file-plus": FilePlus,
};

const toneMap = {
  mint: { bg: "bg-mint-soft", chip: "bg-mint text-mint-foreground" },
  amber: { bg: "bg-amber-soft", chip: "bg-amber text-navy" },
  danger: { bg: "bg-danger-soft", chip: "bg-danger text-primary-foreground" },
  navy: { bg: "bg-secondary", chip: "bg-primary text-primary-foreground" },
};

export function KpiCard({
  label, value, delta, tone, icon,
}: { label: string; value: number; delta: string; tone: keyof typeof toneMap; icon: string }) {
  const Icon = iconMap[icon] ?? Boxes;
  const t = toneMap[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_15px_40px_-20px_rgba(15,23,42,0.25)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 font-serif text-4xl tracking-tight">{value.toLocaleString()}</div>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${t.bg}`}>
          <Icon className="h-5 w-5 text-foreground" />
        </span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.chip}`}>•</span>
        <span className="text-xs text-muted-foreground">{delta}</span>
      </div>
    </div>
  );
}
