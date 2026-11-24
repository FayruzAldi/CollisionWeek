"use client";

import React, { useState } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useToast } from "./ui/Toast";

interface DateMoveSolverProps {
  candidates: DateMoveProposalCandidate[];
  weekNumber: number;
  currentCollisionCount: number;
  onProposalAccepted?: () => void;
}

export function DateMoveSolver({
  candidates,
  weekNumber,
  currentCollisionCount,
  onProposalAccepted,
}: DateMoveSolverProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleAction = async (
    candidate: DateMoveProposalCandidate,
    action: "ACCEPT" | "REJECT"
  ) => {
    const candidateKey = `${candidate.assignmentId}-${candidate.proposedWeek}`;
    setProcessingId(candidateKey);

    try {
      const res = await fetch(`/api/proposals/${candidate.id || candidate.assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          candidate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === "ACCEPT") {
          showToast(
            `Berhasil! "${candidate.assignmentTitle}" digeser ke Pekan ${candidate.proposedWeek}. Beban dihitung ulang.`,
            "success"
          );
          if (onProposalAccepted) {
            onProposalAccepted();
          }
        } else {
          showToast("Usulan pergeseran ditolak.", "info");
        }
      } else {
        showToast(data.error || "Gagal memproses pergeseran tanggal.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat memproses pergeseran.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="cw-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cw-line">
        <div>
          <h3 className="text-[15px] font-semibold text-cw-ink">
            Mesin pergeseran tanggal minimal
          </h3>
          <p className="text-xs text-cw-muted mt-0.5 max-w-2xl leading-relaxed">
            Menilai pekan tetangga (w-1, w+1, w+2) untuk mencari pergeseran terkecil yang menurunkan tabrakan di bawah 3 tanpa memicu tabrakan baru.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-cw-muted bg-cw-subtle px-2.5 py-1 rounded-xl border border-cw-line self-start sm:self-auto">
          <span>Pekan {weekNumber} saat ini:</span>
          <span className="font-semibold text-semantic-danger-fg">
            Cw = {currentCollisionCount}
          </span>
        </div>
      </div>

      {/* Daftar usulan sebagai baris ber-hairline */}
      {candidates.length === 0 ? (
        <div className="text-center py-6 text-cw-faint">
          <p className="text-xs font-medium text-cw-muted">Tidak perlu pergeseran tanggal.</p>
          <p className="text-xs text-cw-faint mt-0.5">
            Pekan {weekNumber} memiliki Cw &lt; 3 atau pekan tetangga sudah mencapai kapasitas beban.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-cw-line">
          {candidates.map((cand, idx) => {
            const candidateKey = `${cand.assignmentId}-${cand.proposedWeek}`;
            const isProcessing = processingId === candidateKey;

            return (
              <div
                key={candidateKey}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                {/* Informasi usulan */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-center font-semibold text-cw-ink bg-cw-sunken px-2 py-0.5 rounded-md">
                      {cand.courseCode}
                    </span>
                    <h4 className="text-[13px] font-semibold text-cw-ink">
                      {cand.assignmentTitle}
                    </h4>
                    {idx === 0 && (
                      <Badge variant="success" shape="pill">
                        Paling optimal
                      </Badge>
                    )}
                  </div>

                  {/* Trayektori pergeseran */}
                  <div className="flex items-center gap-2 text-xs text-cw-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cw-faint" strokeWidth={1.75} />
                      <span>Pekan {cand.originalWeek} ({formatDate(cand.originalDueDate)})</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-cw-faint" strokeWidth={1.75} />
                    <span className="font-medium text-cw-ink flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cw-accent" strokeWidth={1.75} />
                      <span>Pekan {cand.proposedWeek} ({formatDate(cand.proposedDueDate)})</span>
                    </span>

                    <span className="text-cw-line">|</span>

                    <span>
                      Cw = {cand.originalCollisionCount} → {cand.projectedCollisionCount}
                    </span>

                    <span className="text-cw-line">|</span>

                    <span className="inline-flex items-center gap-1 text-semantic-success-fg font-medium">
                      <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
                      <span>Beban -{cand.loadReductionDelta} poin</span>
                    </span>
                  </div>
                </div>

                {/* Tombol aksi */}
                <div className="flex items-center gap-2 self-end lg:self-auto flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleAction(cand, "REJECT")}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleAction(cand, "ACCEPT")}
                  >
                    {isProcessing ? "Memproses..." : "Terapkan"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
