"use client";

import React, { useState } from "react";
import { parseAndValidateCsv, SAMPLE_CSV_CONTENT, CsvValidationResult } from "@/lib/csv-parser";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export default function CsvIngestionPage() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_CONTENT);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleValidate = () => {
    setUploadSuccess(null);
    setUploadError(null);
    const result = parseAndValidateCsv(csvText);
    setValidationResult(result);
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
    link.setAttribute("download", "collision_week_sample_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.isValid) {
      alert("Please validate and fix errors in CSV before committing.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadSuccess(null);
      setUploadError(null);

      const res = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadSuccess(
          `Successfully imported ${data.importedCount} assignments! Weekly metrics recalculated across 16 weeks.`
        );
      } else {
        setUploadError(data.error || "Failed to commit CSV data.");
      }
    } catch {
      setUploadError("Network error importing CSV.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Reset database to initial synthetic demo dataset?")) return;
    try {
      setIsResetting(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        alert("Synthetic demonstration data restored!");
        window.location.reload();
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Schedule Ingestion &amp; Calendar Config
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#5850EC]">
              Layer 1 (US-01)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload departmental CSV assignment spreadsheets. Calculates due date week mapping ($1 \dots 16$) and collision indices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Template</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span>{isResetting ? "Resetting..." : "Reset Demo"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Two-Column Editor & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="trenning-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">CSV Input &amp; File Upload</h3>
              <p className="text-xs text-slate-500">
                Required columns: <code>course_code, title, type, weight_score, due_date, subtopics</code>
              </p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-[#5850EC]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select local .csv file:
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EEF0FD] file:text-[#5850EC] hover:file:bg-[#E0E3FC] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Or paste / edit CSV text directly:
            </label>
            <textarea
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#5850EC]/30 focus:outline-hidden leading-relaxed"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleValidate}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Validate Schema</span>
            </button>

            <button
              onClick={handleCommit}
              disabled={isUploading || !validationResult?.isValid}
              className="px-5 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Layers className="w-4 h-4" />
              <span>{isUploading ? "Recalculating..." : "Commit & Calculate Heat Map"}</span>
            </button>
          </div>
        </div>

        {/* Right: Validation Inspector */}
        <div className="trenning-card p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Validation Inspector</h3>
              <p className="text-xs text-slate-500">
                Pre-commit schema validation &amp; line-by-line syntax verification
              </p>
            </div>
            {validationResult ? (
              validationResult.isValid ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Valid (100%)
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Errors Found
                </span>
              )
            ) : (
              <span className="text-xs text-slate-400">Not validated yet</span>
            )}
          </div>

          {validationResult ? (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[460px]">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Rows</span>
                  <span className="text-base font-black text-slate-800">{validationResult.totalRows}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block text-[10px] uppercase font-bold">Valid</span>
                  <span className="text-base font-black text-emerald-700">{validationResult.validRows.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block text-[10px] uppercase font-bold">Invalid</span>
                  <span className="text-base font-black text-rose-700">{validationResult.invalidRows.length}</span>
                </div>
              </div>

              {/* Errors list */}
              {validationResult.invalidRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Line Errors:
                  </h4>
                  {validationResult.invalidRows.map((err) => (
                    <div
                      key={err.rawRowNumber}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1"
                    >
                      <div className="font-bold flex items-center gap-1 text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Row #{err.rawRowNumber} Error:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {err.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Valid rows preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Valid Assignments Preview:
                </h4>
                <div className="space-y-1.5">
                  {validationResult.validRows.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 mr-2">[{v.course_code}]</span>
                        <span className="text-slate-600">{v.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          Weight: {v.weight_score}
                        </span>
                        <span className="text-[10px] text-slate-400">{v.due_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Click &quot;Validate Schema&quot; to preview rows before committing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Day Milestone Placeholders (PRD Section 4 & 8.1) */}
      <section className="trenning-card p-6 space-y-4 bg-slate-50/70 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
              Final Day Milestone #1
            </span>
            <span className="text-xs text-slate-500">
              Substantive development reserved for Final Day live build session (16 Dec 2026)
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Competition Transparency
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 opacity-80 flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>PDF Syllabus Text &amp; Deadline Parser</span>
              </h4>
              <p className="text-xs text-slate-500">
                Extracts assessment deadlines and course codes automatically from uploaded PDF course outlines.
              </p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold border border-slate-200 cursor-not-allowed"
            >
              Planned for Final Day
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 opacity-80 flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Moodle / Google Classroom Direct Ingestion</span>
              </h4>
              <p className="text-xs text-slate-500">
                Direct LMS API synchronization for university single-sign-on course rosters.
              </p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold border border-slate-200 cursor-not-allowed"
            >
              Planned for Final Day
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
