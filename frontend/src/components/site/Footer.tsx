import { Pill } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Pill className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold">MediStock</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Inventory intelligence built for the rhythm of a modern pharmacy.
          </p>
        </div>
        {[
          { title: "Product", links: ["Dashboard", "Inventory", "Alerts", "Reports"] },
          { title: "Company", links: ["About", "Pharmacies", "Pricing", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} MediStock Systems</span>
          <span>Made for pharmacies that care about every batch.</span>
        </div>
      </div>
    </footer>
  );
}
