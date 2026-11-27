"use client";

import React, { useState } from "react";
import { HelpRequestData, ResponseType } from "@/lib/types";
import { useRole } from "@/context/RoleContext";
import { formatDateTime } from "@/lib/utils";
import {
  X,
  FileText,
  Video,
  Clock,
  Send,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";
import { Badge } from "./ui/Badge";
import { useToast } from "./ui/Toast";
import { UserAvatar } from "./ui/UserAvatar";

interface HelpResponseDrawerProps {
  request: HelpRequestData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function HelpResponseDrawer({
  request,
  isOpen,
  onClose,
  onUpdated,
}: HelpResponseDrawerProps) {
  const { currentUser } = useRole();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ResponseType>("WRITTEN");
  const [writtenContent, setWrittenContent] = useState("");
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedNotes, setRecordedNotes] = useState("");
  const [sessionDateTime, setSessionDateTime] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      const res = await fetch(`/api/help-requests/${request.id}/resolve`, {
        method: "PATCH",
      });
      if (res.ok) {
        showToast("Kendala berhasil ditandai selesai.", "success");
        onUpdated();
      } else {
        showToast("Gagal menandai selesai.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat menandai selesai.", "error");
    } finally {
      setIsResolving(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let contentOrUrl = "";
    let scheduledSlot: string | null = null;

    if (activeTab === "WRITTEN") {
      if (!writtenContent.trim()) {
        setError("Tuliskan penjelasan atau langkah penyelesaian.");
        return;
      }
      contentOrUrl = writtenContent.trim();
    } else if (activeTab === "RECORDED_LINK") {
      if (!recordedUrl.trim()) {
        setError("Masukkan tautan rekaman (Loom, Drive, YouTube).");
        return;
      }
      contentOrUrl = recordedNotes.trim()
        ? `${recordedUrl.trim()}\nCatatan: ${recordedNotes.trim()}`
        : recordedUrl.trim();
    } else if (activeTab === "SESSION_20MIN") {
      if (!sessionDateTime) {
        setError("Tentukan jadwal untuk sesi 20 menit.");
        return;
      }
      scheduledSlot = new Date(sessionDateTime).toISOString();
      contentOrUrl = sessionNotes.trim()
        ? `Usulan sesi 20 menit pada ${sessionDateTime}. Agenda: ${sessionNotes.trim()}`
        : `Usulan sesi 20 menit pada ${sessionDateTime}.`;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/help-requests/${request.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseType: activeTab,
          contentOrUrl,
          scheduledSlot,
        }),
      });

      if (res.ok) {
        setWrittenContent("");
        setRecordedUrl("");
        setRecordedNotes("");
        setSessionDateTime("");
        setSessionNotes("");
        showToast("Tanggapan berhasil dikirim!", "success");
        onUpdated();
      } else {
        const d = await res.json();
        setError(d.error || "Gagal mengirim tanggapan.");
      }
    } catch {
      setError("Koneksi gagal saat mengirim tanggapan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResolved = request.status === "RESOLVED";
  const responses = request.responses || [];
  const requesterName = request.requester?.name || "Mahasiswa";
  const courseCode = request.assignment?.course?.courseCode;
  const assignmentTitle = request.assignment?.title || "Detail Bantuan Tugas";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-cw-ink/40 backdrop-blur-[2px]">
      <div className="bg-cw-surface w-full max-w-xl h-full shadow-modal flex flex-col border-l border-cw-line animate-scale-in">
        {/* Header Drawer */}
        <div className="p-5 border-b border-cw-line flex items-start justify-between sticky top-0 bg-cw-surface z-10">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-1.5">
              {courseCode && <Tag>{courseCode}</Tag>}
              <Tag>#{request.subtopicLabel}</Tag>
              {request.isUrgent && (
                <Badge variant="danger" shape="pill">
                  Butuh bantuan (&gt;12 jam)
                </Badge>
              )}
              <Badge
                variant={isResolved ? "success" : "neutral"}
                shape="pill"
              >
                {isResolved ? "Selesai" : "Terbuka"}
              </Badge>
            </div>
            <h3 className="font-semibold text-cw-ink text-base">
              {assignmentTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-cw-faint pt-0.5">
              <UserAvatar
                src={request.requester?.avatarUrl}
                name={requesterName}
                size="xs"
                shape="circle"
              />
              <span>
                Ditanyakan {requesterName} · {formatDateTime(request.createdAt)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup panel tanggapan"
            className="p-1.5 rounded-xl text-cw-faint hover:text-cw-ink hover:bg-cw-sunken transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Badan Konten */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Kotak Pertanyaan / Kendala */}
          <div className="p-4 rounded-xl bg-cw-subtle border border-cw-line space-y-1.5">
            <span className="text-[11px] font-medium text-cw-faint block">
              Kendala
            </span>
            <p className="text-[13px] text-cw-ink leading-relaxed whitespace-pre-wrap">
              {request.questionDetail}
            </p>
          </div>

          {/* Blok Status Penyelesaian */}
          <div className="p-3.5 rounded-xl border border-cw-line bg-cw-surface flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isResolved ? "bg-semantic-success-ring" : "bg-semantic-warning-ring"
                }`}
              />
              <span className="text-cw-muted">
                {isResolved
                  ? `Selesai pada ${formatDateTime(request.resolvedAt)}`
                  : "Penanya dan penolong sama-sama bisa menandai selesai."}
              </span>
            </div>

            {!isResolved && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResolve}
                disabled={isResolving}
              >
                {isResolving ? "Memproses..." : "Tandai selesai"}
              </Button>
            )}
          </div>

          {/* Daftar Tanggapan Teman Sekelas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-semibold text-cw-ink">
                Tanggapan ({responses.length})
              </h4>
            </div>

            {responses.length === 0 ? (
              <div className="text-center py-8 text-cw-faint bg-cw-subtle rounded-xl border border-dashed border-cw-line">
                <p className="text-xs font-medium text-cw-muted">Belum ada tanggapan.</p>
                <p className="text-[11px] text-cw-faint mt-0.5">
                  Jadilah yang pertama membantu {requesterName}.
                </p>
              </div>
            ) : (
              responses.map((resp) => {
                const isWritten = resp.responseType === "WRITTEN";
                const isRecorded = resp.responseType === "RECORDED_LINK";
                const isSession = resp.responseType === "SESSION_20MIN";
                const helperName = resp.helper?.name || "Rekan";

                return (
                  <div
                    key={resp.id}
                    className="p-3.5 rounded-xl border border-cw-line bg-cw-surface space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={resp.helper?.avatarUrl}
                          name={helperName}
                          size="xs"
                          shape="circle"
                        />
                        <span className="font-semibold text-cw-ink">
                          {helperName}
                        </span>
                        <span className="text-[11px] text-cw-faint">
                          ({resp.helper?.role === "LECTURER" ? "Dosen" : "Mahasiswa"})
                        </span>
                      </div>
                      <span className="text-[11px] text-cw-faint">
                        {formatDateTime(resp.createdAt)}
                      </span>
                    </div>

                    <div className="text-[13px] text-cw-muted leading-relaxed">
                      {isWritten && (
                        <div className="space-y-2">
                          <p className="whitespace-pre-wrap">{resp.contentOrUrl}</p>
                          {(() => {
                            const match = resp.contentOrUrl.match(/https?:\/\/[^\s]+/);
                            if (!match) return null;
                            return (
                              <a
                                href={match[0]}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cw-subtle border border-cw-line text-xs text-cw-accent hover:underline font-medium break-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                                <span>Buka referensi materi</span>
                              </a>
                            );
                          })()}
                        </div>
                      )}

                      {isRecorded && (() => {
                        const lines = resp.contentOrUrl.split("\n").map((l) => l.trim()).filter(Boolean);
                        const videoUrl = lines[0] || "";
                        const notes = lines.slice(1).join("\n");
                        const platform = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
                          ? "YouTube"
                          : videoUrl.includes("loom.com")
                          ? "Loom Video"
                          : videoUrl.includes("drive.google.com")
                          ? "Google Drive"
                          : "Tautan Materi";

                        return (
                          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800">
                                <Video className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" strokeWidth={1.75} />
                                <span>{platform}</span>
                              </span>
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 transition-colors"
                              >
                                <span>Tonton / Buka</span>
                                <ExternalLink className="w-3 h-3" strokeWidth={2} />
                              </a>
                            </div>
                            <p className="text-[11px] text-indigo-700/80 break-all font-mono bg-white/70 px-2 py-1 rounded-md">
                              {videoUrl}
                            </p>
                            {notes && (
                              <p className="text-xs text-cw-ink leading-relaxed whitespace-pre-wrap">
                                {notes}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {isSession && (() => {
                        const urlMatch = resp.contentOrUrl.match(/https?:\/\/[^\s]+/);
                        return (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.75} />
                                <span>Sesi Bimbingan 20 Menit</span>
                              </div>
                              {urlMatch && (
                                <a
                                  href={urlMatch[0]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors"
                                >
                                  <span>Gabung Sesi</span>
                                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-cw-ink whitespace-pre-wrap">{resp.contentOrUrl}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form Kirim Tanggapan di Bagian Bawah */}
        <div className="p-4 border-t border-cw-line bg-cw-surface space-y-3">
          {/* Segmented Control 3 Tab */}
          <div className="flex items-center bg-cw-sunken rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("WRITTEN")}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "WRITTEN"
                  ? "bg-cw-surface text-cw-ink font-semibold shadow-sm"
                  : "text-cw-muted hover:text-cw-ink"
              }`}
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Tulisan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RECORDED_LINK")}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "RECORDED_LINK"
                  ? "bg-cw-surface text-cw-ink font-semibold shadow-sm"
                  : "text-cw-muted hover:text-cw-ink"
              }`}
            >
              <Video className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Rekaman</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SESSION_20MIN")}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "SESSION_20MIN"
                  ? "bg-cw-surface text-cw-ink font-semibold shadow-sm"
                  : "text-cw-muted hover:text-cw-ink"
              }`}
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Sesi 20 menit</span>
            </button>
          </div>

          {error && (
            <p className="text-xs text-semantic-danger-fg font-medium">{error}</p>
          )}

          <form onSubmit={handleSendResponse} className="space-y-2.5">
            {activeTab === "WRITTEN" && (
              <textarea
                value={writtenContent}
                onChange={(e) => setWrittenContent(e.target.value)}
                placeholder="Tulis penjelasan atau langkah penyelesaian..."
                rows={3}
                className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-2.5 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
              />
            )}

            {activeTab === "RECORDED_LINK" && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={recordedUrl}
                  onChange={(e) => setRecordedUrl(e.target.value)}
                  placeholder="Tempel tautan rekaman (Loom, Drive, YouTube)"
                  className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-2 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                />
                <input
                  type="text"
                  value={recordedNotes}
                  onChange={(e) => setRecordedNotes(e.target.value)}
                  placeholder="Catatan singkat (opsional)"
                  className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-2 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                />
              </div>
            )}

            {activeTab === "SESSION_20MIN" && (
              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={sessionDateTime}
                  onChange={(e) => setSessionDateTime(e.target.value)}
                  className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-2 text-cw-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                />
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Tautan rapat (Meet/Zoom) atau catatan"
                  className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-2 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting}
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{isSubmitting ? "Mengirim..." : "Kirim tanggapan"}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
