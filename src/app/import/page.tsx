"use client";

import React, { useRef, useState } from "react";
import { parseAndValidateCsv, SAMPLE_CSV_CONTENT, CsvValidationResult } from "@/lib/csv-parser";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  UploadCloud,
  FileCheck2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useRole } from "@/context/RoleContext";
import { MascotBanner } from "@/components/MascotCommunicator";
import Image from "next/image";

const CSV_TEMPLATES = [
  { code: "IF-2027", label: "Teknik Informatika", file: "/csv-templates/jadwal-teknik-informatika.csv" },
  { code: "SI-2027", label: "Sistem Informasi", file: "/csv-templates/jadwal-sistem-informasi.csv" },
  { code: "TE-2027", label: "Teknik Elektro", file: "/csv-templates/jadwal-teknik-elektro.csv" },
  { code: "TI-2027", label: "Teknik Industri", file: "/csv-templates/jadwal-teknik-industri.csv" },
  { code: "MN-2027", label: "Manajemen", file: "/csv-templates/jadwal-manajemen.csv" },
  { code: "AK-2027", label: "Akuntansi", file: "/csv-templates/jadwal-akuntansi.csv" },
];

export default function CsvIngestionPage() {
  const { role, currentUser, can } = useRole();
  const isPrivileged = role === "ADMIN" || role === "LECTURER";
  const visibleTemplates =
    role === "ADMIN"
      ? CSV_TEMPLATES
      : CSV_TEMPLATES.filter((t) => t.code === currentUser?.program?.code);
  const [csvText, setCsvText] = useState(SAMPLE_CSV_CONTENT);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState<{ name: string; sizeKb: string } | null>(null);
  const [importProgress, setImportProgress] = useState<{
    percent: number;
    step: number;
    label: string;
    status: "idle" | "running" | "done" | "error";
    summary?: string;
  }>({
    percent: 0,
    step: 0,
    label: "",
    status: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleValidate = () => {
    const result = parseAndValidateCsv(csvText);
    setValidationResult(result);
    setImportProgress({ percent: 0, step: 0, label: "", status: "idle" });
    if (result.isValid) {
      showToast("Format CSV valid! Siap disimpan dan dihitung.", "success");
    } else {
      showToast(`Ditemukan ${result.invalidRows.length} baris bermasalah.`, "error");
    }
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      showToast("Harap pilih berkas dengan ekstensi .csv", "error");
      return;
    }

    setSelectedFileInfo({
      name: file.name,
      sizeKb: Math.max(0.1, file.size / 1024).toFixed(1),
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setCsvText(text);
      const result = parseAndValidateCsv(text);
      setValidationResult(result);
      setImportProgress({ percent: 0, step: 0, label: "", status: "idle" });
      if (result.isValid) {
        showToast(`Berkas "${file.name}" siap diimpor (${result.validRows.length} tugas valid).`, "success");
      } else {
        showToast(`"${file.name}" dimuat, ditemukan ${result.invalidRows.length} baris bermasalah.`, "error");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.isValid) {
      showToast("Validasi skema dan perbaiki kesalahan terlebih dahulu.", "error");
      return;
    }

    try {
      setIsUploading(true);
      setImportProgress({
        percent: 20,
        step: 1,
        label: "Memvalidasi skema & format kolom CSV...",
        status: "running",
      });

      await new Promise((r) => setTimeout(r, 220));
      setImportProgress({
        percent: 55,
        step: 2,
        label: `Mengunggah ${validationResult.validRows.length} tugas & mencocokkan jurusan...`,
        status: "running",
      });

      const res = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText }),
      });

      setImportProgress({
        percent: 85,
        step: 3,
        label: "Menghitung ulang peta beban 16 pekan & deteksi tabrakan...",
        status: "running",
      });

      const data = await res.json();
      if (res.ok) {
        setImportProgress({
          percent: 100,
          step: 4,
          label: "Impor selesai & peta beban diperbarui!",
          status: "done",
          summary: `${data.importedCount} tugas masuk ke jurusan ${data.programName || "terpilih"} (${data.flaggedWeeksCount ?? 0} pekan kritis terdeteksi).`,
        });
        showToast(
          `${data.importedCount} tugas berhasil diimpor. Peta beban dihitung ulang.`,
          "success"
        );
      } else {
        setImportProgress({
          percent: 100,
          step: 2,
          label: data.error || "Gagal menyimpan data CSV.",
          status: "error",
        });
        showToast(data.error || "Gagal menyimpan data CSV.", "error");
      }
    } catch {
      setImportProgress({
        percent: 100,
        step: 2,
        label: "Koneksi terputus saat mengimpor CSV.",
        status: "error",
      });
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

  const handleLoadTemplate = async (fileUrl: string, label: string) => {
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("Gagal mengunduh templat");
      const text = await res.text();
      setCsvText(text);
      const result = parseAndValidateCsv(text);
      setValidationResult(result);
      showToast(`Templat CSV ${label} dimuat & divalidasi (${result.validRows.length} tugas).`, "success");
    } catch {
      showToast("Gagal memuat templat CSV jurusan.", "error");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-7">
      {!isPrivileged ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="relative w-32 h-32">
            <Image
              src="/mascots/umk/stress.webp"
              alt="Maskot akses terbatas"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold text-cw-muted">
            <Lock className="w-5 h-5" strokeWidth={1.75} />
            <span>Halaman ini hanya untuk dosen dan admin</span>
          </div>
          <p className="text-sm text-cw-faint max-w-xs">
            Hanya dosen pengampu atau admin akademik yang dapat mengimpor jadwal tugas.
          </p>
        </div>
      ) : (
        <>
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cw-line">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
            Impor Jadwal
          </h2>
          <p className="text-xs text-cw-muted mt-0.5">
            Unggah CSV tenggat tugas ({role === "ADMIN" ? "semua jurusan terdeteksi otomatis dari kode matkul" : `Jurusan ${currentUser?.program?.name || ""}`}).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {can("demo.reset") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              disabled={isResetting}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} strokeWidth={1.75} />
              <span>{isResetting ? "Memulihkan..." : "Atur ulang data"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Maskot Assistant: Cody (BINUS) */}
      <MascotBanner
        persona="binus"
        callout={
          importProgress.status === "running"
            ? "PROSES..."
            : importProgress.status === "done"
            ? "BERES!"
            : importProgress.status === "error"
            ? "CEK ULANG!"
            : "SIAP IMPOR!"
        }
        pose={
          importProgress.status === "running"
            ? "working.webp"
            : importProgress.status === "done"
            ? "success.webp"
            : importProgress.status === "error"
            ? "stress.webp"
            : "calculating.webp"
        }
        tone={
          importProgress.status === "done"
            ? "success"
            : importProgress.status === "error"
            ? "warning"
            : "default"
        }
        headline={
          importProgress.status === "running"
            ? "Cody sedang memproses impor jadwal..."
            : importProgress.status === "done"
            ? "Jadwal berhasil diimpor & beban dihitung ulang!"
            : importProgress.status === "error"
            ? "Terjadi kendala saat mengimpor CSV"
            : "Siap membantu impor & validasi jadwal CSV"
        }
        message={
          importProgress.summary ||
          "Seret berkas .csv ke kotak unggah di bawah atau muat templat jurusan terlebih dahulu, lalu tekan Validasi Skema."
        }
      />

      {/* Progress Bar Impor Multi-Tahap */}
      {importProgress.status !== "idle" && (
        <div className="cw-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-cw-ink">{importProgress.label}</span>
            <span className="font-bold tabular-nums text-cw-accent">
              {importProgress.percent}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-cw-sunken overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                importProgress.status === "done"
                  ? "bg-emerald-500"
                  : importProgress.status === "error"
                  ? "bg-rose-500"
                  : "bg-cw-accent"
              }`}
              style={{ width: `${importProgress.percent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 1, name: "1. Validasi" },
              { id: 2, name: "2. Unggah Data" },
              { id: 3, name: "3. Hitung Beban" },
              { id: 4, name: "4. Selesai" },
            ].map((s) => {
              const reached = importProgress.step >= s.id;
              const failedHere = importProgress.status === "error" && importProgress.step === s.id;
              return (
                <div
                  key={s.id}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                    failedHere
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : reached
                      ? "bg-cw-accent-soft/60 border-cw-accent-line text-cw-accent font-semibold"
                      : "bg-cw-subtle border-cw-line text-cw-faint"
                  }`}
                >
                  {s.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Baris Unduh / Muat Templat CSV per Jurusan */}
      <div className="cw-card p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-cw-ink">
            Templat CSV Siap Pakai {role === "ADMIN" ? "(6 Jurusan)" : `(${currentUser?.program?.name || "Jurusan Anda"})`}
          </span>
          <span className="text-[11px] text-cw-faint">
            Klik nama jurusan untuk memuat ke editor, atau ikon unduh untuk menyimpan berkas .csv
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(visibleTemplates.length > 0 ? visibleTemplates : CSV_TEMPLATES.slice(0, 1)).map((tpl) => (
            <div
              key={tpl.code}
              className="inline-flex items-center rounded-xl border border-cw-line bg-cw-subtle overflow-hidden text-xs"
            >
              <button
                type="button"
                onClick={() => handleLoadTemplate(tpl.file, tpl.label)}
                className="px-3 py-1.5 font-medium text-cw-ink hover:bg-cw-accent-soft hover:text-cw-accent transition-colors"
              >
                {tpl.label}
              </button>
              <a
                href={tpl.file}
                download
                title={`Unduh CSV ${tpl.label}`}
                className="px-2 py-1.5 border-l border-cw-line text-cw-muted hover:text-cw-accent hover:bg-cw-surface transition-colors"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
              </a>
            </div>
          ))}
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

          <div className="space-y-2">
            <label className="block text-xs font-medium text-cw-ink">
              Unggah berkas .csv
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="sr-only"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
                isDragging
                  ? "border-cw-accent bg-cw-accent-soft/50 scale-[1.01]"
                  : "border-cw-line bg-cw-subtle/70 hover:border-cw-accent/60 hover:bg-cw-subtle"
              }`}
            >
              <UploadCloud
                className={`w-9 h-9 mx-auto mb-2 transition-colors ${
                  isDragging ? "text-cw-accent" : "text-cw-faint"
                }`}
                strokeWidth={1.6}
              />
              <p className="text-xs font-semibold text-cw-ink">
                {isDragging
                  ? "Lepaskan berkas .csv di sini..."
                  : "Seret & jatuhkan berkas .csv di sini (Drop here)"}
              </p>
              <p className="text-[11px] text-cw-muted mt-1">
                atau <span className="text-cw-accent font-semibold underline">klik untuk memilih berkas</span> dari perangkat Anda
              </p>
            </div>

            {selectedFileInfo && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-cw-accent-soft/40 border border-cw-accent-line text-xs">
                <span className="flex items-center gap-2 min-w-0">
                  <FileCheck2 className="w-4 h-4 text-cw-accent flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-semibold text-cw-ink truncate">{selectedFileInfo.name}</span>
                  <span className="text-[11px] text-cw-muted flex-shrink-0">
                    ({selectedFileInfo.sizeKb} KB)
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Hapus pilihan file"
                  onClick={() => {
                    setSelectedFileInfo(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1 rounded-lg text-cw-muted hover:text-cw-ink hover:bg-cw-surface"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
                <div className="grid grid-cols-3 divide-x divide-cw-line border-y border-cw-line py-3 text-center text-xs">
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
                          className="py-2 text-xs text-semantic-danger-fg space-y-0.5"
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
                          className="py-2 border-b border-cw-line last:border-b-0 text-xs flex items-center justify-between"
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
      </>
      )}
    </div>
  );
}
