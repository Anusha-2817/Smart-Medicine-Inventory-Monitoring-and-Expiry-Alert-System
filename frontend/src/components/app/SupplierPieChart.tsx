import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { supplierContribution as mockData } from "@/lib/mock-dashboard";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

interface Props { data?: { name: string; value: number }[]; }

export function SupplierPieChart({ data }: Props) {
  const chartData = data ?? mockData;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl">Supplier contribution</h3>
          <p className="text-xs text-muted-foreground">Share of supply by vendor</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={3}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {chartData.map((s, i) => (
            <li key={s.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name}
              </span>
              <span className="text-muted-foreground">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
