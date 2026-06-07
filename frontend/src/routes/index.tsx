import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { HeroFloatingCards } from "@/components/site/HeroFloatingCards";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { ZigzagShowcase } from "@/components/site/ZigzagShowcase";
import { StatsBand } from "@/components/site/StatsBand";
import { CtaBand } from "@/components/site/CtaBand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediStock — Inventory intelligence for modern pharmacies" },
      { name: "description", content: "Track every batch, every expiry, every movement. MediStock is a smart medicine inventory and expiry alert system for pharmacies." },
      { property: "og:title", content: "MediStock — Inventory intelligence for modern pharmacies" },
      { property: "og:description", content: "Track every batch, every expiry, every movement. Smart inventory built for the rhythm of a modern pharmacy." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1 text-xs uppercase tracking-widest text-mint-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Smart Medicine Inventory
              </div>
              <h1 className="mt-6 font-serif text-6xl leading-[1.02] tracking-tight md:text-7xl">
                Inventory intelligence <em className="italic text-muted-foreground">for modern pharmacies.</em>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Track every batch. Catch every expiry. Audit every movement. MediStock
                turns your pharmacy stockroom into a single, calm source of truth.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Open dashboard <span aria-hidden>→</span>
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium hover:bg-secondary"
                >
                  See features
                </a>
              </div>
              <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground">
                <div><span className="text-foreground font-semibold">1,250+</span> SKUs tracked</div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-foreground font-semibold">3,420</span> live batches</div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-foreground font-semibold">0</span> expired sales</div>
              </div>
            </motion.div>
            <div className="relative">
              <HeroFloatingCards />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border/60 bg-secondary/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-8 text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-widest">Trusted by pharmacy teams at</span>
            {["Apollo Care", "MedPlus", "Wellness Forever", "Netmeds Pro", "1mg Labs"].map((n) => (
              <span key={n} className="font-serif text-xl tracking-tight">{n}</span>
            ))}
          </div>
        </section>

        <FeatureGrid />

        {/* Pull quote */}
        <section className="border-t border-border/60 bg-background py-28">
          <div className="mx-auto max-w-5xl px-6">
            <p className="font-serif text-4xl leading-[1.15] md:text-6xl">
              <em className="italic text-mint-foreground">"Expired stock</em> is a tax on
              every pharmacy. MediStock makes that tax <em className="italic">optional.</em>
            </p>
            <div className="mt-8 text-sm text-muted-foreground">
              — Built around the workflow your pharmacists already trust.
            </div>
          </div>
        </section>

        <ZigzagShowcase />
        <StatsBand />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
