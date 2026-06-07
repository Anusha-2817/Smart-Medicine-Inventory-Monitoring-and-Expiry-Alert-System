import { motion } from "framer-motion";
import { Boxes, BellRing, ArrowLeftRight, Truck, ClipboardList, FileSpreadsheet } from "lucide-react";

const features = [
  { icon: Boxes, title: "Batch tracking", text: "Every batch traced separately — manufacture date, expiry, supplier, status." },
  { icon: BellRing, title: "Expiry alerts", text: "Severity-tiered warnings at 7, 30, and 90 days. No expired stock slips through." },
  { icon: ArrowLeftRight, title: "Stock movements", text: "Immutable audit trail. STOCK_IN, STOCK_OUT, ADJUSTMENT — every change reasoned." },
  { icon: Truck, title: "Supplier management", text: "Single source of truth for vendors, contacts, and supply contribution." },
  { icon: ClipboardList, title: "Purchase orders", text: "Reorder suggestions when stock dips below threshold. Approve, deliver, close." },
  { icon: FileSpreadsheet, title: "Import & export", text: "CSV and XLSX in, reports out. Validation errors surfaced row-by-row." },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-border/60 bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-mint-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Capabilities
            </span>
          </div>
          <h2 className="mt-6 font-serif text-5xl leading-[1.05] md:text-6xl">
            Twelve modules. <em className="italic text-muted-foreground">One coherent surface.</em>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            MediStock maps directly to your pharmacy workflow — from the first batch
            scan to the last quarterly report.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative bg-card p-8 transition-colors hover:bg-mint-soft/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-serif text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
