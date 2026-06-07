import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { stockDistribution as mockData } from "@/lib/mock-dashboard";

interface Props { data?: { name: string; qty: number }[]; }

export function StockDistributionChart({ data }: Props) {
  const chartData = data ?? mockData;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl">Stock distribution</h3>
          <p className="text-xs text-muted-foreground">Top medicines by quantity on hand</p>
        </div>
        <span className="text-xs text-muted-foreground">Units</span>
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--mint-soft)" }}
              contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
            />
            <Bar dataKey="qty" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
