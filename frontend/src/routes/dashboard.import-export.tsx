import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Download,
  Upload,
  History,
  Pill,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImportCard } from "@/components/app/ImportCard";
import {
  importMedicines,
  importInventory,
  importSuppliers,
  getImportHistory,
  downloadTemplate,
} from "@/lib/services/import.service";

export const Route = createFileRoute("/dashboard/import-export")({
  head: () => ({ meta: [{ title: "Import / Export · MediStock" }] }),
  component: ImportExportPage,
});

type Tab = "import" | "export" | "history";

const TAB_LABELS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "import", label: "Import", icon: <Upload className="h-4 w-4" /> },
  { id: "export", label: "Export & Templates", icon: <Download className="h-4 w-4" /> },
  { id: "history", label: "Import History", icon: <History className="h-4 w-4" /> },
];

const IMPORT_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  MEDICINES: { label: "Medicines", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  INVENTORY: { label: "Inventory", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  SUPPLIERS: { label: "Suppliers", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
};

function ImportExportPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("import");
  const [historyPage, setHistoryPage] = useState(1);

  const { data: historyData, isLoading: histLoading } = useQuery({
    queryKey: ["import-history", historyPage],
    queryFn: () => getImportHistory({ page: historyPage, limit: 15 }),
    enabled: tab === "history",
  });

  const historyRecords = historyData?.data ?? [];
  const historyTotal = historyData?.total ?? 0;
  const totalPages = Math.ceil(historyTotal / 15);

  const downloadExport = (url: string, filename: string) => {
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
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Import / Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bulk import medicines, inventory and suppliers from CSV or XLSX files.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1 w-fit">
        {TAB_LABELS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── IMPORT TAB ─────────────────────────────────────────── */}
      {tab === "import" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
            <span>
              Supported formats: <strong className="text-foreground">CSV</strong> and{" "}
              <strong className="text-foreground">XLSX</strong>. Download sample templates from the
              <button
                onClick={() => setTab("export")}
                className="ml-1 text-primary underline-offset-2 hover:underline"
              >
                Export &amp; Templates
              </button>{" "}
              tab.
            </span>
          </div>

          <ImportCard
            title="Import Medicines"
            description="Name, Generic Name, Category, Manufacturer, SKU, Prescription, Reorder Threshold"
            icon={<Pill className="h-5 w-5" />}
            color="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            onUpload={importMedicines}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["medicines"] })}
          />

          <ImportCard
            title="Import Inventory Batches"
            description="Medicine SKU, Batch Number, Quantity, Unit Cost, Supplier, Manufacture Date, Expiry Date"
            icon={<Package className="h-5 w-5" />}
            color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            onUpload={importInventory}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["inventory"] })}
          />

          <ImportCard
            title="Import Suppliers"
            description="Supplier Name, Contact Person, Phone, Email, Address"
            icon={<Truck className="h-5 w-5" />}
            color="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            onUpload={importSuppliers}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["suppliers"] })}
          />
        </div>
      )}

      {/* ─── EXPORT & TEMPLATES TAB ──────────────────────────────── */}
      {tab === "export" && (
        <div className="mt-6 space-y-6">
          {/* Data Exports */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Export Data
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ExportCard
                title="Export Medicines"
                description="Download all medicines as CSV"
                icon={<Pill className="h-5 w-5" />}
                color="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                buttonLabel="Download CSV"
                onClick={() => downloadExport("/api/export/medicines", "medicines.csv")}
              />
              <ExportCard
                title="Export Inventory"
                description="Download all inventory batches as CSV"
                icon={<Package className="h-5 w-5" />}
                color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                buttonLabel="Download CSV"
                onClick={() => downloadExport("/api/export/inventory", "inventory.csv")}
              />
            </div>
          </div>

          {/* Templates */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Sample Import Templates
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download these CSV templates to see the correct column format before importing.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <ExportCard
                title="Medicines Template"
                description="CSV template with required columns"
                icon={<Pill className="h-5 w-5" />}
                color="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                buttonLabel="Download Template"
                buttonVariant="outline"
                onClick={() => downloadTemplate("medicines")}
              />
              <ExportCard
                title="Inventory Template"
                description="CSV template with required columns"
                icon={<Package className="h-5 w-5" />}
                color="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                buttonLabel="Download Template"
                buttonVariant="outline"
                onClick={() => downloadTemplate("inventory")}
              />
              <ExportCard
                title="Suppliers Template"
                description="CSV template with required columns"
                icon={<Truck className="h-5 w-5" />}
                color="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                buttonLabel="Download Template"
                buttonVariant="outline"
                onClick={() => downloadTemplate("suppliers")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── HISTORY TAB ─────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">File Name</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Uploaded</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Success</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Failed</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uploaded By</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground">
                      Loading history…
                    </td>
                  </tr>
                ) : historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground">
                      <History className="mx-auto h-8 w-8 mb-3 opacity-30" />
                      No import history yet
                    </td>
                  </tr>
                ) : (
                  historyRecords.map((record: any) => {
                    const badge = IMPORT_TYPE_BADGE[record.importType] ?? {
                      label: record.importType,
                      color: "bg-secondary text-muted-foreground",
                    };
                    return (
                      <tr key={record.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate" title={record.fileName}>
                          {record.fileName}
                        </td>
                        <td className="px-4 py-3 text-center">{record.uploadedCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {record.successCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {record.failedCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-500">
                              <XCircle className="h-3.5 w-3.5" />
                              {record.failedCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-xs">{record.user?.name ?? "—"}</p>
                            <p className="text-[10px] text-muted-foreground">{record.user?.email}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  Page {historyPage} of {totalPages} · {historyTotal} records
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                    disabled={historyPage >= totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs hover:bg-secondary disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Export Card ───────────────────────────────────────────────────
function ExportCard({
  title,
  description,
  icon,
  color,
  buttonLabel,
  buttonVariant = "primary",
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  buttonLabel: string;
  buttonVariant?: "primary" | "outline";
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${color}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-base leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
          buttonVariant === "primary"
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border bg-background hover:bg-secondary"
        }`}
      >
        <Download className="h-4 w-4" /> {buttonLabel}
      </button>
    </div>
  );
}
