const stats = [
  { v: "0", l: "Expired SKUs missed" },
  { v: "12", l: "Integrated modules" },
  { v: "<1s", l: "Alert latency" },
  { v: "CSV·XLSX", l: "Bulk import & export" },
];

export function StatsBand() {
  return (
    <section id="stats" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="font-serif text-6xl">{s.v}</div>
            <div className="mt-2 text-sm opacity-70">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
