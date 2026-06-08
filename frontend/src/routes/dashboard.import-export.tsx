import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/import-export")({
  head: () => ({ meta: [{ title: "Import / Export · MediStock" }] }),
  component: ImportExportPage,
});

function ImportExportPage() {
  const download = (url: string, filename: string) => {
    const token = localStorage.getItem("medistock_token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Import / Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">Export your data as CSV or import from a file.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Export Medicines */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-soft text-mint-foreground">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-xl">Export Medicines</h3>
              <p className="text-xs text-muted-foreground">Download all medicines as CSV</p>
            </div>
          </div>
          <button
            onClick={() => download("/api/export/medicines", "medicines.csv")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>

        {/* Export Inventory */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-soft text-mint-foreground">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-xl">Export Inventory</h3>
              <p className="text-xs text-muted-foreground">Download all batches as CSV</p>
            </div>
          </div>
          <button
            onClick={() => download("/api/export/inventory", "inventory.csv")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
