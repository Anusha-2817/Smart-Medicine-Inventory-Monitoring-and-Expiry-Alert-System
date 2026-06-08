import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { expiryTrend as mockData } from "@/lib/mock-dashboard";

interface Props { data?: { month: string; count: number }[]; }

export function ExpiryTrendChart({ data }: Props) {
  const chartData = data ?? mockData;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl">Expiry trend</h3>
          <p className="text-xs text-muted-foreground">Batches expiring in the next six months</p>
        </div>
        <span className="text-xs text-muted-foreground">Batches</span>
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--mint)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="count" stroke="var(--mint)" strokeWidth={2.5} fill="url(#expGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
