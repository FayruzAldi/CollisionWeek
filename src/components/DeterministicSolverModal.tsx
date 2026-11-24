"use client";

import React, { useState, useEffect } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Tag } from "./ui/Tag";
import { useToast } from "./ui/Toast";

interface DeterministicSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeterministicSolverModal({
  isOpen,
  onClose,
  onSuccess,
}: DeterministicSolverModalProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(10);
  const [candidates, setCandidates] = useState<DateMoveProposalCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWeekCandidates(selectedWeek);
    }
  }, [isOpen, selectedWeek]);

  const fetchWeekCandidates = async (w: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weeks/${w}`);
      if (res.ok) {
        const json = await res.json();
        setCandidates(json.candidates || []);
      }
    } catch (err) {
      console.error("Gagal memuat usulan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyShift = async (cand: DateMoveProposalCandidate) => {
    const key = `${cand.assignmentId}-${cand.proposedWeek}`;
    try {
      setProcessingId(key);
      const res = await fetch(`/api/proposals/${cand.id || cand.assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          candidate: cand,
        }),
      });

      if (res.ok) {
        showToast(
          `Berhasil digeser ke Pekan ${cand.proposedWeek}! Beban semester diperbarui.`,
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showToast("Gagal menerapkan pergeseran tanggal.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat menerapkan pergeseran.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solver pergeseran tanggal"
      description="Heuristik deterministik: menyeimbangkan tenggat yang bertabrakan tanpa memicu tabrakan baru."
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
        {/* Kolom Kiri: Pengaturan Target */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-cw-subtle border border-cw-line space-y-3">
            <span className="text-xs font-semibold text-cw-ink block">
              Pekan yang ingin diseimbangkan:
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedWeek(10)}
                className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs ${
                  selectedWeek === 10
                    ? "bg-cw-surface border-cw-accent ring-1 ring-cw-accent/30 text-cw-ink font-semibold"
                    : "bg-cw-surface border-cw-line text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
                }`}
              >
                <span>Pekan 10 (Proyek Puncak)</span>
                <Badge variant="danger" shape="pill">
                  Cw = 4
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWeek(14)}
                className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs ${
                  selectedWeek === 14
                    ? "bg-cw-surface border-cw-accent ring-1 ring-cw-accent/30 text-cw-ink font-semibold"
                    : "bg-cw-surface border-cw-line text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
                }`}
              >
                <span>Pekan 14 (pra-UAS)</span>
                <Badge variant="danger" shape="pill">
                  Cw = 5
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWeek(6)}
                className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs ${
                  selectedWeek === 6
                    ? "bg-cw-surface border-cw-accent ring-1 ring-cw-accent/30 text-cw-ink font-semibold"
                    : "bg-cw-surface border-cw-line text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
                }`}
              >
                <span>Pekan 6 (Mid-term)</span>
                <Badge variant="warning" shape="pill">
                  Cw = 3
                </Badge>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cw-subtle border border-cw-line space-y-1.5 text-xs">
            <span className="text-[11px] font-medium text-cw-faint block">
              Tingkat batasan:
            </span>
            <span className="font-semibold text-cw-ink block">
              Ketat (Cw &lt; 3)
            </span>
            <p className="text-[11px] text-cw-muted leading-relaxed">
              Hanya menerima usulan geser +1 atau +2 pekan jika pekan tujuan tetap memiliki Cw &lt; 3.
            </p>
          </div>

          <p className="text-[11px] text-cw-faint leading-relaxed px-1">
            Perhitungan heuristik deterministik, tanpa model bahasa.
          </p>
        </div>

        {/* Kolom Kanan: Daftar Usulan Rekomendasi */}
        <div className="md:col-span-7 space-y-3">
          <span className="text-xs font-semibold text-cw-ink block">
            Usulan pergeseran
          </span>

          {loading ? (
            <div className="py-12 text-center text-xs text-cw-faint">
              Menghitung pergeseran...
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-cw-subtle border border-dashed border-cw-line text-xs text-cw-faint">
              Tidak ada usulan untuk pekan ini.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {candidates.map((cand, idx) => {
                const key = `${cand.assignmentId}-${cand.proposedWeek}`;
                const isProcessing = processingId === key;

                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl border border-cw-line bg-cw-surface space-y-2 text-xs"
                  >
                    <div className="flex items-center text-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag>{cand.courseCode}</Tag>
                        <h4 className="font-semibold text-cw-ink text-xs truncate">
                          {cand.assignmentTitle}
                        </h4>
                      </div>
                      {idx === 0 && (
                        <Badge variant="success" shape="pill">
                          Paling optimal
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-cw-muted flex-wrap">
                      <span>Pekan {cand.originalWeek}</span>
                      <ArrowRight className="w-3 h-3 text-cw-faint" strokeWidth={1.75} />
                      <span className="font-medium text-cw-ink">
                        Pekan {cand.proposedWeek} ({formatDate(cand.proposedDueDate)})
                      </span>
                      <span className="text-cw-line">|</span>
                      <span>
                        Cw = {cand.originalCollisionCount} → {cand.projectedCollisionCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-semantic-success-fg">
                        <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
                        <span>Beban -{cand.loadReductionDelta} poin</span>
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleApplyShift(cand)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>{isProcessing ? "Memproses..." : "Terapkan"}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-cw-line">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">
          Tutup
        </Button>
      </div>
    </Modal>
  );
}
