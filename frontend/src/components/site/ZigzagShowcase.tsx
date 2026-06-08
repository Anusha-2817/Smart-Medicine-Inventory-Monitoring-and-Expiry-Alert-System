import { motion } from "framer-motion";

const rows = [
  {
    eyebrow: "Dashboard",
    title: "The whole pharmacy, at a glance.",
    text: "Six KPI tiles, three live charts, and a recent-activity stream. Catch a problem before it becomes a recall.",
    mock: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Medicines", v: "1,250", tint: "bg-mint-soft" },
            { l: "Expiring 30d", v: "45", tint: "bg-amber-soft" },
            { l: "Low stock", v: "17", tint: "bg-danger-soft" },
          ].map((k) => (
            <div key={k.l} className={`rounded-xl ${k.tint} p-3`}>
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="mt-1 font-serif text-xl">{k.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-28 rounded-xl bg-secondary p-3">
          <div className="flex h-full items-end gap-2">
            {[40, 70, 55, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Alerts",
    title: "Severity-tiered expiry monitoring.",
    text: "SAFE, WARNING, CRITICAL, EXPIRED. Every batch ranked by days remaining — never sell what shouldn't be on the shelf.",
    mock: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)]">
        {[
          { name: "Amoxicillin 500mg", batch: "A-2231", days: "6 days", sev: "CRITICAL", tint: "bg-amber-soft text-amber" },
          { name: "Paracetamol 650mg", batch: "P-1180", days: "28 days", sev: "WARNING", tint: "bg-amber-soft text-amber" },
          { name: "Cetirizine 10mg", batch: "C-0941", days: "Expired", sev: "EXPIRED", tint: "bg-danger-soft text-danger" },
          { name: "Vitamin D3", batch: "V-0612", days: "84 days", sev: "SAFE", tint: "bg-mint-soft text-mint-foreground" },
        ].map((r) => (
          <div key={r.batch} className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
            <div>
              <div className="text-sm font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">Batch {r.batch} · {r.days}</div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${r.tint}`}>{r.sev}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Stock movements",
    title: "An honest audit trail.",
    text: "Inventory quantities are never edited directly. STOCK_IN, STOCK_OUT, ADJUSTMENT — reasoned, timestamped, attributed.",
    mock: (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)]">
        {[
          { t: "STOCK_IN", m: "+120 Paracetamol 650mg", who: "Riya · 09:24", tint: "bg-mint-soft text-mint-foreground" },
          { t: "STOCK_OUT", m: "-8 Amoxicillin 500mg", who: "OTC sale · 10:11", tint: "bg-secondary text-foreground" },
          { t: "ADJUSTMENT", m: "-2 Cetirizine 10mg (damaged)", who: "Vikram · 11:02", tint: "bg-amber-soft text-amber" },
          { t: "STOCK_IN", m: "+60 Vitamin D3", who: "PO-1142 · 13:48", tint: "bg-mint-soft text-mint-foreground" },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${m.tint}`}>{m.t}</span>
              <span className="text-sm">{m.m}</span>
            </div>
            <span className="text-xs text-muted-foreground">{m.who}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ZigzagShowcase() {
  return (
    <section id="workflow" className="bg-background py-24">
      <div className="mx-auto max-w-7xl space-y-28 px-6">
        {rows.map((row, i) => {
          const reverse = i % 2 === 1;
          return (
            <div key={row.title} className="grid items-center gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={reverse ? "md:order-2" : ""}
              >
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{row.eyebrow}</div>
                <h3 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{row.title}</h3>
                <p className="mt-4 max-w-md text-muted-foreground">{row.text}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={reverse ? "md:order-1" : ""}
              >
                {row.mock}
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
