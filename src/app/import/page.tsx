"use client";

import React, { useState } from "react";
import { parseAndValidateCsv, SAMPLE_CSV_CONTENT, CsvValidationResult } from "@/lib/csv-parser";
import { Download, RotateCcw, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function CsvIngestionPage() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_CONTENT);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { showToast } = useToast();

  const handleValidate = () => {
    const result = parseAndValidateCsv(csvText);
    setValidationResult(result);
    if (result.isValid) {
      showToast("Format CSV valid! Siap disimpan dan dihitung.", "success");
    } else {
      showToast(`Ditemukan ${result.invalidRows.length} baris bermasalah.`, "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const result = parseAndValidateCsv(text);
      setValidationResult(result);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "templat_jadwal_tugas_collision_week.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.isValid) {
      showToast("Validasi skema dan perbaiki kesalahan terlebih dahulu.", "error");
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          `${data.importedCount} tugas berhasil diimpor. Peta beban dihitung ulang.`,
          "success"
        );
      } else {
        showToast(data.error || "Gagal menyimpan data CSV.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat mengimpor CSV.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        showToast("Data demo 16 pekan berhasil dipulihkan!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        showToast("Gagal mengatur ulang data demo.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat mengatur ulang data.", "error");
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-7">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cw-line">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
            Impor Jadwal
          </h2>
          <p className="text-xs text-cw-muted mt-0.5">
            Unggah CSV tenggat tugas. Sistem memetakan tanggal ke pekan 1-16 dan menghitung tabrakan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={handleDownloadSample}>
            <Download className="w-4 h-4" strokeWidth={1.75} />
            <span>Unduh templat</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            disabled={isResetting}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} strokeWidth={1.75} />
            <span>{isResetting ? "Memulihkan..." : "Atur ulang data"}</span>
          </Button>
        </div>
      </div>

      {/* Tata Letak Dua Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Input CSV */}
        <div className="cw-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cw-line">
            <div>
              <h3 className="text-base font-semibold text-cw-ink">Berkas CSV</h3>
              <p className="text-xs text-cw-muted mt-0.5">
                Kolom wajib: <code>course_code, title, type, weight_score, due_date, subtopics</code>
              </p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-cw-accent" strokeWidth={1.75} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-cw-ink">
              Pilih berkas .csv
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-cw-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cw-accent-soft file:text-cw-accent hover:file:bg-cw-sunken cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-cw-ink">
              Atau tempel dan sunting langsung:
            </label>
            <textarea
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full text-xs font-mono rounded-xl border border-cw-line p-3 bg-cw-subtle text-cw-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={handleValidate}>
              <CheckCircle2 className="w-4 h-4 text-semantic-success-fg" strokeWidth={1.75} />
              <span>Validasi skema</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCommit}
              disabled={isUploading || !validationResult?.isValid}
            >
              <span>{isUploading ? "Menghitung..." : "Simpan & hitung"}</span>
            </Button>
          </div>
        </div>

        {/* Kolom Kanan: Inspektur Validasi */}
        <div className="cw-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cw-line">
              <div>
                <h3 className="text-base font-semibold text-cw-ink">Hasil validasi</h3>
                <p className="text-xs text-cw-muted mt-0.5">
                  Pemeriksaan skema dan verifikasi sintaks per baris
                </p>
              </div>

              {validationResult ? (
                validationResult.isValid ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-semantic-success-soft text-semantic-success-fg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Valid
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-semantic-danger-soft text-semantic-danger-fg flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Ada kesalahan
                  </span>
                )
              ) : (
                <span className="text-xs text-cw-faint">Belum divalidasi</span>
              )}
            </div>

            {validationResult ? (
              <div className="space-y-4">
                {/* 3 Angka Ringkasan dengan Hairline */}
                <div className="grid grid-cols-3 divide-x divide-cw-line border border-cw-line rounded-xl bg-cw-subtle p-2 text-center text-xs">
                  <div>
                    <span className="text-[11px] text-cw-faint block">Baris</span>
                    <span className="text-base font-semibold text-cw-ink tabular-nums">
                      {validationResult.totalRows}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-semantic-success-fg block">Valid</span>
                    <span className="text-base font-semibold text-semantic-success-fg tabular-nums">
                      {validationResult.validRows.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-semantic-danger-fg block">Bermasalah</span>
                    <span className="text-base font-semibold text-semantic-danger-fg tabular-nums">
                      {validationResult.invalidRows.length}
                    </span>
                  </div>
                </div>

                {/* Kesalahan per baris */}
                {validationResult.invalidRows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-semantic-danger-fg">
                      Kesalahan per baris:
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {validationResult.invalidRows.map((err) => (
                        <div
                          key={err.rawRowNumber}
                          className="p-2.5 rounded-xl bg-semantic-danger-soft/50 border border-semantic-danger-soft text-xs text-semantic-danger-fg space-y-0.5"
                        >
                          <span className="font-semibold block font-mono">
                            Baris {err.rawRowNumber}:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                            {err.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pratinjau tugas yang valid */}
                {validationResult.validRows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-cw-ink">
                      Pratinjau tugas ({validationResult.validRows.length}):
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {validationResult.validRows.slice(0, 10).map((v, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-cw-subtle border border-cw-line text-xs flex items-center justify-between"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-cw-ink mr-2">[{v.course_code}]</span>
                            <span className="text-cw-muted">{v.title}</span>
                          </div>
                          <span className="text-[11px] text-cw-faint flex-shrink-0">
                            {v.due_date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-cw-faint">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-cw-line" strokeWidth={1.5} />
                <p className="text-xs">Klik &quot;Validasi skema&quot; untuk melihat pratinjau.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Reset */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        title="Atur ulang data demo?"
        message="Tindakan ini akan mengembalikan seluruh jadwal tugas ke data sintetis 16 pekan awal."
        confirmLabel="Ya, atur ulang"
        tone="danger"
        onConfirm={handleResetData}
        onCancel={() => setResetDialogOpen(false)}
      />
    </div>
  );
}
