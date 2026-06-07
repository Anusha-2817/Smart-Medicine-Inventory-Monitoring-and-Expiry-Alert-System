import { Link } from "@tanstack/react-router";

export function CtaBand() {
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-serif text-5xl leading-[1.05] md:text-7xl">
          See your pharmacy <em className="italic">come into focus.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Open the live demo dashboard and explore the system with seeded data — no signup, no friction.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Open the demo dashboard <span aria-hidden>→</span>
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium hover:bg-secondary"
          >
            Browse capabilities
          </a>
        </div>
      </div>
    </section>
  );
}
