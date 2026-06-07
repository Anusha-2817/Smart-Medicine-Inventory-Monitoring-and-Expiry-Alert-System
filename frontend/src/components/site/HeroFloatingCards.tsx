import { motion } from "framer-motion";
import { Boxes, AlertTriangle, TrendingDown } from "lucide-react";

const cards = [
  { icon: Boxes, label: "Total Medicines", value: "1,250", tint: "bg-mint-soft text-navy", delta: "+24 this week" },
  { icon: AlertTriangle, label: "Expiring in 30 days", value: "45", tint: "bg-amber-soft text-navy", delta: "3 critical" },
  { icon: TrendingDown, label: "Low stock", value: "17", tint: "bg-danger-soft text-navy", delta: "Reorder ready" },
];

export function HeroFloatingCards() {
  return (
    <div className="relative h-[440px] w-full">
      <div className="absolute -inset-10 -z-10 rounded-full bg-mint/30 blur-3xl" />
      <div className="absolute right-10 top-4 -z-10 h-48 w-48 rounded-full bg-amber/30 blur-3xl" />
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * i, duration: 0.6, ease: "easeOut" }}
          className="absolute w-[260px] rounded-2xl border border-border bg-card p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]"
          style={{
            top: `${30 + i * 90}px`,
            left: `${i * 60}px`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${c.tint}`}>
              <c.icon className="h-4 w-4" />
            </span>
            <span className="text-xs text-muted-foreground">{c.delta}</span>
          </div>
          <div className="mt-4 text-3xl font-serif">{c.value}</div>
          <div className="text-sm text-muted-foreground">{c.label}</div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-0 right-0 w-[280px] rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-[0_20px_60px_-20px_rgba(15,23,42,0.5)]"
      >
        <div className="text-xs uppercase tracking-widest opacity-70">Live alert</div>
        <div className="mt-2 font-serif text-xl leading-tight">
          Batch #A-2231 of Amoxicillin expires in 6 days.
        </div>
        <div className="mt-3 inline-flex h-7 items-center rounded-full bg-mint px-3 text-xs font-medium text-mint-foreground">
          CRITICAL
        </div>
      </motion.div>
    </div>
  );
}
