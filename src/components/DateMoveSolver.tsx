"use client";

import React, { useEffect, useState } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  TrendingDown,
  Calendar,
  Lock,
  Send,
  MessageSquareQuote,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Tag } from "./ui/Tag";
import { useToast } from "./ui/Toast";
import { useRole } from "@/context/RoleContext";
import { UserAvatar } from "./ui/UserAvatar";

interface StudentShiftRequestItem {
  id: string;
  originalWeek: number;
  proposedWeek: number;
  reason: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    program?: { id: string; name: string } | null;
  };
  assignment: {
    id: string;
    title: string;
    weekNumber: number;
    course: {
      courseCode: string;
      courseName: string;
      lecturerId: string;
      lecturer?: { id: string; name: string } | null;
    };
  };
}

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
  const [shiftRequests, setShiftRequests] = useState<StudentShiftRequestItem[]>([]);
  const [selectedCandKey, setSelectedCandKey] = useState<string>("");
  const [reasonText, setReasonText] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const { showToast } = useToast();
  const { role, currentUser, can } = useRole();
  const isPrivileged = can("schedule.move");

  const fetchShiftRequests = async () => {
    try {
      const res = await fetch(`/api/shift-requests?weekNumber=${weekNumber}`);
      if (res.ok) {
        const json = await res.json();
        setShiftRequests(json.requests || []);
      }
    } catch {
      // Abaikan jika gagal memuat aspirasi
    }
  };

  useEffect(() => {
    fetchShiftRequests();
  }, [weekNumber, currentUser?.id]);

  useEffect(() => {
    if (candidates.length > 0 && !selectedCandKey) {
      setSelectedCandKey(`${candidates[0].assignmentId}-${candidates[0].proposedWeek}`);
    }
  }, [candidates]);

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

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen =
      candidates.find((c) => `${c.assignmentId}-${c.proposedWeek}` === selectedCandKey) ||
      candidates[0];
    if (!chosen) {
      showToast("Belum ada usulan tugas yang tersedia untuk pekan ini.", "error");
      return;
    }
    if (reasonText.trim().length < 8) {
      showToast("Tuliskan alasan minimal 8 karakter agar dosen dapat mempertimbangkannya.", "error");
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await fetch("/api/shift-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: chosen.assignmentId,
          proposedWeek: chosen.proposedWeek,
          reason: reasonText.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast("Permintaan geser jadwal & alasan berhasil dikirim ke dosen!", "success");
        setReasonText("");
        if (data.request) {
          setShiftRequests((prev) => [data.request, ...prev]);
        } else {
          fetchShiftRequests();
        }
      } else {
        showToast(data.error || "Gagal mengirim permintaan.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat mengirim permintaan.", "error");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const visibleCandidates =
    role === "LECTURER" && currentUser?.id
      ? candidates.filter((c) => !c.lecturerId || c.lecturerId === currentUser.id)
      : candidates;

  return (
    <div className="cw-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cw-line">
        <div>
          <h3 className="text-[15px] font-semibold text-cw-ink">
            {isPrivileged ? "Rekomendasi Geser Jadwal" : "Ajukan Pergeseran Jadwal ke Dosen"}
          </h3>
          <p className="text-xs text-cw-muted mt-0.5 max-w-2xl leading-relaxed">
            {role === "LECTURER"
              ? "Anda hanya dapat menggeser tugas pada mata kuliah yang Anda ampu. Aspirasi alasan mahasiswa tampil di bawah."
              : role === "ADMIN"
              ? "Pilih rekomendasi pergeseran paling ringan untuk menurunkan penumpukan tenggat tanpa memicu tabrakan baru."
              : "Mahasiswa tidak dapat langsung menggeser jadwal, tetapi dapat mengusulkan pergeseran tugas dan menuliskan alasannya untuk dosen."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-cw-muted bg-cw-subtle px-2.5 py-1 rounded-xl border border-cw-line self-start sm:self-auto flex-shrink-0">
          <span>Pekan {weekNumber}:</span>
          <span className="font-semibold text-semantic-danger-fg">
            {currentCollisionCount} matkul bentrok
          </span>
        </div>
      </div>

      {/* Konten Utama: Mahasiswa (Form Usulan + Alasan) vs Dosen/Admin (Eksekusi Solver) */}
      {!isPrivileged ? (
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <div className="p-4 rounded-xl bg-cw-subtle border border-cw-line text-xs text-cw-muted text-center">
              Pekan {weekNumber} sedang seimbang, belum ada tugas besar bertabrakan yang perlu diajukan pergeseran.
            </div>
          ) : (
            <form onSubmit={handleStudentSubmit} className="p-4 rounded-2xl bg-cw-subtle border border-cw-line space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-cw-ink">
                  Pilih tugas &amp; pekan tujuan yang ingin diajukan ke dosen:
                </label>
                <select
                  value={selectedCandKey}
                  onChange={(e) => setSelectedCandKey(e.target.value)}
                  className="w-full rounded-xl border border-cw-line bg-cw-surface px-3 py-2 text-xs text-cw-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                >
                  {candidates.map((cand) => {
                    const key = `${cand.assignmentId}-${cand.proposedWeek}`;
                    return (
                      <option key={key} value={key}>
                        [{cand.courseCode}] {cand.assignmentTitle} (Pekan {cand.originalWeek} → Pekan {cand.proposedWeek})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-cw-ink">
                  Alasan pengajuan pergeseran:
                </label>
                <textarea
                  rows={2}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Contoh: Di Pekan 10 ada 4 tenggat proyek besar bersamaan, butuh tambahan waktu untuk integrasi & pengujian."
                  className="w-full rounded-xl border border-cw-line bg-cw-surface p-3 text-xs text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-cw-faint flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Hanya dosen pengampu / admin yang berhak menyetujui.</span>
                </span>
                <Button variant="primary" size="sm" type="submit" disabled={submittingRequest}>
                  <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{submittingRequest ? "Mengirim..." : "Ajukan ke Dosen"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          {visibleCandidates.length === 0 ? (
            <div className="text-center py-5 text-cw-faint bg-cw-subtle rounded-xl border border-dashed border-cw-line px-4">
              <p className="text-xs font-medium text-cw-muted">
                {role === "LECTURER"
                  ? "Tidak ada tugas mata kuliah Anda yang perlu digeser di pekan ini."
                  : "Tidak ada pergeseran yang diperlukan."}
              </p>
              <p className="text-xs text-cw-faint mt-0.5">
                {role === "LECTURER"
                  ? "Jika pekan ini padat, dosen pengampu mata kuliah lain yang bertugas di pekan ini dapat menggeser jadwalnya masing-masing."
                  : `Pekan ${weekNumber} sudah aman atau pekan terdekat sudah penuh.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cw-line">
              {visibleCandidates.map((cand, idx) => {
                const candidateKey = `${cand.assignmentId}-${cand.proposedWeek}`;
                const isProcessing = processingId === candidateKey;
                const isOwner =
                  role === "ADMIN" ||
                  (role === "LECTURER" &&
                    (!cand.lecturerId || cand.lecturerId === currentUser?.id));

                return (
                  <div
                    key={candidateKey}
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-center font-semibold text-cw-ink bg-cw-sunken px-2 py-0.5 rounded-md">
                          {cand.courseCode}
                        </span>
                        <h4 className="text-[13px] font-semibold text-cw-ink">
                          {cand.assignmentTitle}
                        </h4>
                        {idx === 0 && isOwner && (
                          <Badge variant="success" shape="pill">
                            Disarankan
                          </Badge>
                        )}
                        {role === "LECTURER" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Mata kuliah Anda
                          </span>
                        )}
                      </div>

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
                          Bentrok: {cand.originalCollisionCount} → {cand.projectedCollisionCount} matkul
                        </span>
                        <span className="text-cw-line">|</span>
                        <span className="inline-flex items-center gap-1 text-semantic-success-fg font-medium">
                          <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
                          <span>Beban -{cand.loadReductionDelta} poin</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-auto flex-shrink-0">
                      {isOwner ? (
                        <>
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
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cw-subtle border border-cw-line text-[11px] text-cw-muted font-medium">
                          <Lock className="w-3 h-3" strokeWidth={1.75} />
                          <span>Khusus {cand.lecturerName || "dosen pengampu"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Bagian Aspirasi & Permintaan Mahasiswa (tampil untuk semua role) */}
      <div className="pt-4 border-t border-cw-line space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-cw-ink flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-cw-accent" strokeWidth={1.75} />
            <span>Permintaan Geser dari Mahasiswa ({shiftRequests.length})</span>
          </h4>
          <span className="text-[11px] text-cw-faint">
            Alasan &amp; usulan mahasiswa pekan {weekNumber}
          </span>
        </div>

        {shiftRequests.length === 0 ? (
          <p className="text-xs text-cw-faint py-2">
            Belum ada permintaan geser jadwal yang diajukan mahasiswa pada pekan ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {shiftRequests.map((sr) => (
              <div
                key={sr.id}
                className="p-3.5 rounded-xl bg-cw-subtle border border-cw-line space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar
                      src={sr.student.avatarUrl}
                      name={sr.student.name}
                      size="sm"
                      shape="circle"
                    />
                    <span className="text-xs font-semibold text-cw-ink truncate">
                      {sr.student.name}
                    </span>
                  </div>
                  <Tag>{sr.assignment.course.courseCode}</Tag>
                </div>

                <p className="text-[11px] font-medium text-cw-accent truncate">
                  {sr.assignment.title} · Pekan {sr.originalWeek} → Pekan {sr.proposedWeek}
                </p>

                <p className="text-xs text-cw-ink leading-relaxed bg-cw-surface p-2.5 rounded-lg border border-cw-line/80">
                  &ldquo;{sr.reason}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
