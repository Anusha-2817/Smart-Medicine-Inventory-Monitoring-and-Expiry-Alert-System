import { useRef, useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ImportResult } from "@/lib/services/import.service";

type Phase = "idle" | "uploading" | "validating" | "importing" | "done" | "error";

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string; // tailwind bg class for icon badge
  onUpload: (file: File) => Promise<ImportResult>;
  onSuccess?: () => void;
}

function downloadErrorCsv(
  errors: { row: number; message: string }[],
  title: string
) {
  const csv = ["Row Number,Error", ...errors.map((e) => `${e.row},"${e.message}"`)].join(
    "\n"
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_errors.csv`;
  a.click();
}

const PHASE_MESSAGES: Record<Phase, string> = {
  idle: "",
  uploading: "Uploading file…",
  validating: "Validating rows…",
  importing: "Importing records…",
  done: "",
  error: "",
};

const PHASE_PROGRESS: Record<Phase, number> = {
  idle: 0,
  uploading: 25,
  validating: 60,
  importing: 85,
  done: 100,
  error: 0,
};

export function ImportCard({ title, description, icon, color, onUpload, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setPhase("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setResult(null);

    try {
      setPhase("uploading");
      await delay(400);
      setPhase("validating");
      await delay(300);
      setPhase("importing");
      const res = await onUpload(file);
      setResult(res);
      setPhase("done");

      if (res.failed === 0) {
        toast.success(`${title}: ${res.imported} records imported successfully`);
        onSuccess?.();
      } else if (res.imported > 0) {
        toast.warning(`${title}: ${res.imported} imported, ${res.failed} failed`);
        onSuccess?.();
      } else {
        toast.error(`${title}: All ${res.failed} rows failed validation`);
        onSuccess?.();
      }
    } catch (err: any) {
      setPhase("error");
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  const reset = () => {
    setFile(null);
    setPhase("idle");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isProcessing = ["uploading", "validating", "importing"].includes(phase);
  const progress = PHASE_PROGRESS[phase];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${color}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Drop Zone */}
        {phase === "idle" || phase === "done" || phase === "error" ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/40"
            }`}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            {file ? (
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">Drop file here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports CSV and XLSX • Max 10 MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : null}

        {/* Progress bar during processing */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {PHASE_MESSAGES[phase]}
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-700 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Panel */}
        {phase === "done" && result && (
          <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
            {/* Summary row */}
            <div className="flex items-center divide-x divide-border">
              <Stat label="Uploaded" value={result.uploaded} className="flex-1" />
              <Stat
                label="Success"
                value={result.imported}
                className="flex-1 text-emerald-600 dark:text-emerald-400"
              />
              <Stat
                label="Failed"
                value={result.failed}
                className="flex-1 text-red-500"
              />
            </div>

            {/* Error table */}
            {result.errors.length > 0 && (
              <div className="border-t border-border">
                <div className="max-h-44 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-secondary/60">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-16">Row</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.errors.map((e, i) => (
                        <tr key={i} className="hover:bg-secondary/20">
                          <td className="px-3 py-2 text-muted-foreground font-mono">{e.row}</td>
                          <td className="px-3 py-2 text-red-500">{e.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-border px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => downloadErrorCsv(result.errors, title)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary transition-colors"
                  >
                    <Download className="h-3 w-3" /> Download Error Report
                  </button>
                </div>
              </div>
            )}

            {result.failed === 0 && (
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All records imported successfully
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            Upload failed. Please check the file and try again.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id={`import-upload-${title.toLowerCase().replace(/\s+/g, "-")}`}
            disabled={!file || isProcessing}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload</>
            )}
          </button>
          {(phase === "done" || phase === "error") && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center py-3 ${className}`}>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
