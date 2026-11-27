"use client";

import React, { useState, useEffect } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Lock,
  Send,
  MessageSquareQuote,
} from "lucide-react";
import { Modal } from "./ui/Modal";
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
  const { role, currentUser } = useRole();
  const isStudent = role === "STUDENT";
  const [flaggedWeeks, setFlaggedWeeks] = useState<
    { weekNumber: number; collisionCount: number; loadIndex: number }[]
  >([
    { weekNumber: 10, collisionCount: 4, loadIndex: 14 },
    { weekNumber: 14, collisionCount: 5, loadIndex: 18 },
    { weekNumber: 6, collisionCount: 3, loadIndex: 11 },
  ]);
  const [selectedWeek, setSelectedWeek] = useState<number>(10);
  const [candidates, setCandidates] = useState<DateMoveProposalCandidate[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentShiftRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeRequestKey, setActiveRequestKey] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState("");
  const { showToast } = useToast();

  // Muat pekan kritis sesuai prodi akun yang login
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/metrics/heatmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((hm) => {
        if (hm?.metrics) {
          const critical = hm.metrics
            .filter((m: any) => m.collisionCount >= 3 || m.isFlagged)
            .sort((a: any, b: any) => b.collisionCount - a.collisionCount);
          if (critical.length > 0) {
            setFlaggedWeeks(critical);
            setSelectedWeek((prev) =>
              critical.some((c: any) => c.weekNumber === prev) ? prev : critical[0].weekNumber
            );
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchWeekData(selectedWeek);
    }
  }, [isOpen, selectedWeek]);

  const fetchWeekData = async (w: number) => {
    try {
      setLoading(true);
      setActiveRequestKey(null);
      setReasonText("");
      const [weekRes, reqRes] = await Promise.all([
        fetch(`/api/weeks/${w}`),
        fetch(`/api/shift-requests?weekNumber=${w}`),
      ]);
      if (weekRes.ok) {
        const json = await weekRes.json();
        setCandidates(json.candidates || []);
      } else {
        setCandidates([]);
      }
      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        setStudentRequests(reqJson.requests || []);
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
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(
          `Berhasil digeser ke Pekan ${cand.proposedWeek}! Beban semester diperbarui.`,
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.error || "Gagal menerapkan pergeseran tanggal.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat menerapkan pergeseran.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStudentSubmitRequest = async (cand: DateMoveProposalCandidate) => {
    const trimmed = reasonText.trim();
    if (trimmed.length < 8) {
      showToast("Tuliskan alasan minimal 8 karakter agar dosen bisa mempertimbangkannya.", "error");
      return;
    }

    const key = `${cand.assignmentId}-${cand.proposedWeek}`;
    try {
      setProcessingId(key);
      const res = await fetch("/api/shift-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: cand.assignmentId,
          proposedWeek: cand.proposedWeek,
          reason: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast("Permintaan geser tanggal dan alasan berhasil dikirim ke dosen!", "success");
        setActiveRequestKey(null);
        setReasonText("");
        if (data.request) {
          setStudentRequests((prev) => [data.request, ...prev]);
        } else {
          fetchWeekData(selectedWeek);
        }
      } else {
        showToast(data.error || "Gagal mengirim permintaan pergeseran.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat mengirim permintaan.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isStudent ? "Ajukan Geser Tanggal ke Dosen" : "Solver Pergeseran Tanggal"}
      description={
        isStudent
          ? "Pilih tugas padat pada pekan kritis, lalu kirimkan usulan pergeseran beserta alasanmu untuk ditinjau dosen pengampu."
          : "Heuristik deterministik: menyeimbangkan tenggat yang bertabrakan tanpa memicu tabrakan baru."
      }
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
        {/* Kolom Kiri: Pengaturan Target */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-cw-subtle border border-cw-line space-y-3">
            <span className="text-xs font-semibold text-cw-ink block">
              Pekan padat di jurusan Anda:
            </span>

            <div className="space-y-2">
              {flaggedWeeks.map((fw) => (
                <button
                  key={fw.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeek(fw.weekNumber)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between text-xs ${
                    selectedWeek === fw.weekNumber
                      ? "bg-cw-surface border-cw-accent ring-1 ring-cw-accent/30 text-cw-ink font-semibold"
                      : "bg-cw-surface border-cw-line text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
                  }`}
                >
                  <span>Pekan {fw.weekNumber}</span>
                  <Badge variant={fw.collisionCount >= 4 ? "danger" : "warning"} shape="pill">
                    Cw = {fw.collisionCount}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cw-subtle border border-cw-line space-y-1.5 text-xs">
            <span className="text-[11px] font-medium text-cw-faint block">
              {isStudent ? "Alur Persetujuan:" : "Aturan Hak Akses:"}
            </span>
            <span className="font-semibold text-cw-ink block">
              {isStudent ? "Ditinjau oleh Dosen Pengampu" : "Khusus Mata Kuliah Anda"}
            </span>
            <p className="text-[11px] text-cw-muted leading-relaxed">
              {isStudent
                ? "Mahasiswa hanya mengajukan usulan dan alasan. Keputusan akhir penggeseran tenggat dilakukan oleh dosen pengampu mata kuliah."
                : "Dosen hanya dapat menerapkan pergeseran pada mata kuliah yang diampu sendiri. Usulan dari mahasiswa tampil di bawah."}
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Usulan & Permintaan Mahasiswa */}
        <div className="md:col-span-7 space-y-4 max-h-[460px] overflow-y-auto pr-1">
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-cw-ink block">
              {isStudent ? "Pilih tugas untuk diusulkan geser:" : "Rekomendasi pergeseran deterministik:"}
            </span>

            {loading ? (
              <div className="py-8 text-center text-xs text-cw-faint">
                Menghitung usulan pekan {selectedWeek}...
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-cw-subtle border border-dashed border-cw-line text-xs text-cw-faint">
                Tidak ada usulan pergeseran untuk Pekan {selectedWeek}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {candidates.map((cand, idx) => {
                  const key = `${cand.assignmentId}-${cand.proposedWeek}`;
                  const isProcessing = processingId === key;
                  const isRequestOpen = activeRequestKey === key;
                  const canLecturerApply =
                    role === "ADMIN" ||
                    (role === "LECTURER" && (!cand.lecturerId || cand.lecturerId === currentUser?.id));

                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-cw-line bg-cw-surface space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
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

                      <div className="flex items-center justify-between pt-0.5 gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-semantic-success-fg">
                          <TrendingDown className="w-3 h-3" strokeWidth={1.75} />
                          <span>Beban -{cand.loadReductionDelta} poin</span>
                        </span>

                        {isStudent ? (
                          <Button
                            variant={isRequestOpen ? "ghost" : "primary"}
                            size="sm"
                            type="button"
                            onClick={() => {
                              setActiveRequestKey(isRequestOpen ? null : key);
                              setReasonText("");
                            }}
                          >
                            <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span>{isRequestOpen ? "Tutup" : "Ajukan ke Dosen"}</span>
                          </Button>
                        ) : canLecturerApply ? (
                          <Button
                            variant="primary"
                            size="sm"
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApplyShift(cand)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span>{isProcessing ? "Memproses..." : "Terapkan"}</span>
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cw-subtle border border-cw-line text-[11px] text-cw-muted">
                            <Lock className="w-3 h-3" strokeWidth={1.75} />
                            <span>Khusus {cand.lecturerName || "dosen pengampu"}</span>
                          </span>
                        )}
                      </div>

                      {/* Form alasan mahasiswa */}
                      {isStudent && isRequestOpen && (
                        <div className="pt-2 border-t border-cw-line space-y-2">
                          <label className="block text-[11px] font-medium text-cw-ink">
                            Alasan pengajuan pergeseran ke Pekan {cand.proposedWeek}:
                          </label>
                          <textarea
                            rows={2}
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            placeholder="Contoh: Ada 3 proyek besar jatuh tempo di minggu yang sama sehingga perlu tambahan waktu uji coba."
                            className="w-full rounded-xl border border-cw-line bg-cw-subtle p-2.5 text-xs text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                          />
                          <div className="flex justify-end">
                            <Button
                              variant="primary"
                              size="sm"
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleStudentSubmitRequest(cand)}
                            >
                              {isProcessing ? "Mengirim..." : "Kirim Permintaan & Alasan"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daftar Permintaan Geser Mahasiswa & Alasannya */}
          <div className="pt-3 border-t border-cw-line space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cw-ink flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5 text-cw-accent" strokeWidth={1.75} />
                <span>Permintaan Mahasiswa Pekan {selectedWeek} ({studentRequests.length})</span>
              </span>
            </div>

            {studentRequests.length === 0 ? (
              <p className="text-[11px] text-cw-faint py-2">
                Belum ada permintaan pergeseran dari mahasiswa pada pekan ini.
              </p>
            ) : (
              <div className="space-y-2">
                {studentRequests.map((sr) => (
                  <div
                    key={sr.id}
                    className="p-3 rounded-xl bg-cw-subtle border border-cw-line space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar
                          src={sr.student.avatarUrl}
                          name={sr.student.name}
                          size="sm"
                          shape="circle"
                        />
                        <span className="font-semibold text-cw-ink truncate">
                          {sr.student.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-cw-accent flex-shrink-0">
                        {sr.assignment.course.courseCode} · Pekan {sr.originalWeek} → {sr.proposedWeek}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-cw-muted truncate">
                      {sr.assignment.title}
                    </p>
                    <p className="text-xs text-cw-ink leading-relaxed">
                      &ldquo;{sr.reason}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
