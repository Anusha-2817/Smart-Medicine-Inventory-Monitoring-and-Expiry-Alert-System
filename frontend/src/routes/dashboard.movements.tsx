import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/movements")({
  head: () => ({ meta: [{ title: "Stock Movements · MediStock" }] }),
  component: MovementsPage,
});

function MovementsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Stock Movements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all IN, OUT, and ADJUSTMENT transactions for inventory.</p>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-soft text-amber mx-auto">
          <ArrowLeftRight className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-2xl">Stock movements history coming soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">A detailed audit trail of all inventory changes will be available here.</p>
      </div>
    </div>
  );
}
