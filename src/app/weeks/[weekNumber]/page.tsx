"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DateMoveSolver } from "@/components/DateMoveSolver";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import { HelpResponseDrawer } from "@/components/HelpResponseDrawer";
import { formatDayDate } from "@/lib/utils";
import { HelpRequestData } from "@/lib/types";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useRole } from "@/context/RoleContext";
import { PastelIllustration, getTopicImage } from "@/components/PastelIllustrations";
import { MascotBanner } from "@/components/MascotCommunicator";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface WeekDetailData {
  weekNumber: number;
  metric: {
    weekNumber: number;
    loadIndex: number;
    collisionCount: number;
    isFlagged: boolean;
  };
  assignments: any[];
  collidingCourses: { code: string; name: string; count: number }[];
  candidates: any[];
  savedProposals: any[];
}

export default function WeekInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programIdParam = searchParams.get("programId");
  const weekNumber = parseInt(params.weekNumber as string, 10) || 8;
  const { showToast } = useToast();
  const { currentUser, role } = useRole();

  const [data, setData] = useState<WeekDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedAssignmentForHelp, setSelectedAssignmentForHelp] = useState<any | null>(null);
  const [assignmentHelpRequests, setAssignmentHelpRequests] = useState<HelpRequestData[]>([]);
  const [selectedHelpRequest, setSelectedHelpRequest] = useState<HelpRequestData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const q = programIdParam ? `?programId=${encodeURIComponent(programIdParam)}` : "";
      const res = await fetch(`/api/weeks/${weekNumber}${q}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Gagal memuat rincian pekan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [weekNumber, programIdParam, currentUser?.id]);

  const isCollision = (data?.metric.collisionCount ?? 0) >= 3;
  const isCaution = (data?.metric.collisionCount ?? 0) === 2;
  const activeAssignment = data?.assignments[selectedAssignmentIndex] || data?.assignments[0];

  const fetchAssignmentHelp = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/help`);
      if (res.ok) {
        const json = await res.json();
        const list: HelpRequestData[] = (json.helpRequests || []).map((h: HelpRequestData) => ({
          ...h,
          assignment: h.assignment || json.assignment,
        }));
        setAssignmentHelpRequests(list);
        setSelectedHelpRequest((prev) =>
          prev ? list.find((h) => h.id === prev.id) ?? prev : null
        );
      }
    } catch {
      setAssignmentHelpRequests([]);
    }
  };

  useEffect(() => {
    if (activeAssignment?.id) {
      fetchAssignmentHelp(activeAssignment.id);
    } else {
      setAssignmentHelpRequests([]);
    }
  }, [activeAssignment?.id]);

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-2 border-b border-cw-line">
        <div className="flex items-center gap-1.5 text-xs text-cw-faint">
          <Link href="/" className="hover:text-cw-ink transition-colors">
            Dasbor
          </Link>
          <span>/</span>
          <span className="text-cw-ink font-medium">Pekan {weekNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
                Pekan {weekNumber}
              </h2>
              {isCollision ? (
                <Badge variant="danger" shape="pill">
                  Pekan bertabrakan (Cw = {data?.metric.collisionCount})
                </Badge>
              ) : isCaution ? (
                <Badge variant="warning" shape="pill">
                  Waspada (Cw = 2)
                </Badge>
              ) : (
                <Badge variant="success" shape="pill">
                  Beban seimbang
                </Badge>
              )}
            </div>
            <p className="text-xs text-cw-muted mt-0.5">
              {data?.assignments.length || 0} tugas · indeks beban {data?.metric.loadIndex || 0} poin
            </p>
          </div>

          {/* Pemilih Pekan 1-16 (terkunci dalam lebar layar mobile agar tidak tembus kanan) */}
          <div className="w-full max-w-full sm:w-auto flex items-center gap-1 bg-cw-surface p-1 rounded-2xl border border-cw-line overflow-x-auto">
            <button
              onClick={() => router.push(`/weeks/${Math.max(1, weekNumber - 1)}`)}
              disabled={weekNumber <= 1}
              aria-label="Pekan sebelumnya"
              className="p-1.5 rounded-lg text-cw-faint hover:text-cw-ink disabled:opacity-30 flex-shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
              const isCurrent = w === weekNumber;
              const isCriticalWeek = w === 6 || w === 8 || w === 10 || w === 14;

              return (
                <button
                  key={w}
                  onClick={() => router.push(`/weeks/${w}`)}
                  className={`w-7 h-7 rounded-xl text-xs font-semibold relative transition-colors flex-shrink-0 ${
                    isCurrent
                      ? "bg-cw-accent text-white"
                      : "text-cw-muted hover:bg-cw-subtle hover:text-cw-ink"
                  }`}
                >
                  {w}
                  {isCriticalWeek && !isCurrent && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-semantic-danger-ring" />
                  )}
                </button>
              );
            })}

            <button
              onClick={() => router.push(`/weeks/${Math.min(16, weekNumber + 1)}`)}
              disabled={weekNumber >= 16}
              aria-label="Pekan berikutnya"
              className="p-1.5 rounded-lg text-cw-faint hover:text-cw-ink disabled:opacity-30 flex-shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Maskot Schedule Assistant: Cody (BINUS) */}
      {!loading && data && (
        <MascotBanner
          persona="binus"
          callout={isCollision ? "CEK SOLVER!" : "JADWAL AMAN!"}
          pose={isCollision ? "calculating.webp" : "resolved.webp"}
          tone={isCollision ? "warning" : "success"}
          headline={
            isCollision
              ? `Pekan ${weekNumber} membutuhkan penyeimbangan (${data.metric.collisionCount} matkul bentrok)`
              : `Pekan ${weekNumber} terpantau aman`
          }
          message={
            isCollision
              ? role === "LECTURER"
                ? "Anda dapat menggeser jadwal mata kuliah yang Anda ampu pada panel Rekomendasi di bawah."
                : role === "ADMIN"
                ? "Gunakan panel Rekomendasi Geser Jadwal di bawah untuk menurunkan bentrok lintas mata kuliah."
                : "Pekan ini padat. Buka bagian Materi & Bantuan Video di bawah untuk mencari panduan atau berdiskusi dengan teman sekelas."
              : "Beban tugas pada pekan ini masih di bawah ambang tabrakan."
          }
        />
      )}

      {/* Tata letak dua kolom (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Daftar Tugas (col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-cw-muted">
              Tugas jatuh tempo ({data?.assignments.length || 0})
            </span>
            <button
              onClick={() => {
                setSelectedAssignmentForHelp(activeAssignment);
                setHelpModalOpen(true);
              }}
              type="button"
              className="text-xs font-semibold text-cw-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Minta bantuan</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-2">
            {data?.assignments.map((item, idx) => {
              const isSelected = selectedAssignmentIndex === idx;
              const isMajor = item.weightScore >= 3;
              const isMyCourse = role === "LECTURER" && item.lecturerId === currentUser?.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAssignmentIndex(idx)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-cw-accent-soft/40 border-cw-accent-line text-cw-ink"
                      : "bg-cw-surface border-cw-line hover:bg-cw-subtle text-cw-ink"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <Tag>{item.courseCode}</Tag>
                      <span className="text-[10px] sm:text-[11px] text-cw-faint font-medium truncate">
                        {isMyCourse ? "Milik Anda · " : isMajor ? "Besar · " : ""}{item.weightScore}/5
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-cw-accent truncate">
                      {item.courseName}
                    </p>

                    <h4 className="font-semibold text-xs text-cw-ink line-clamp-2 leading-snug">
                      {idx + 1}. {item.title}
                    </h4>
                  </div>

                  <div className="pt-1 border-t border-cw-line/70 space-y-0.5 text-[10px] sm:text-[11px] text-cw-muted">
                    <p className="truncate">
                      Dosen: <span className="font-medium text-cw-ink">{item.lecturerName || "-"}</span>
                    </p>
                    <p className="truncate">
                      {formatDayDate(item.dueDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catatan pekan kritis */}
          {isCollision && (
            <div className="p-3.5 rounded-xl bg-semantic-danger-soft border border-semantic-danger-soft text-semantic-danger-fg text-xs space-y-1">
              <span className="font-semibold block">Pekan ini bertabrakan</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                Pekan {weekNumber} memiliki {data?.collidingCourses.length} tenggat tugas besar yang bertabrakan. Gunakan solver di samping untuk menyeimbangkan beban.
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Rincian Tugas, Materi/Video & Geser Jadwal (col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {activeAssignment && (
            <div className="cw-card overflow-hidden">
              <div className="p-3 pb-0">
                <div className="h-32 w-full relative rounded-xl overflow-hidden">
                  <PastelIllustration
                    palette="biru"
                    imageSrc={getTopicImage(
                      `${activeAssignment.courseCode} ${activeAssignment.courseName} ${activeAssignment.title}`,
                      weekNumber
                    )}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/75 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md">
                      {activeAssignment.courseCode} · {activeAssignment.courseName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cw-line">
                <div>
                  <span className="text-xs text-cw-faint">
                    Dosen: {activeAssignment.lecturerName}
                  </span>
                  <h3 className="text-base font-semibold text-cw-ink mt-0.5">
                    {activeAssignment.title}
                  </h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setSelectedAssignmentForHelp(activeAssignment);
                    setHelpModalOpen(true);
                  }}
                >
                  Minta bantuan sub-topik
                </Button>
              </div>

              {/* Rincian 3 Kolom */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-cw-line border-y border-cw-line">
                <div className="py-3 sm:pr-4">
                  <span className="text-[11px] text-cw-faint block">Tenggat</span>
                  <span className="text-xs font-semibold text-cw-ink mt-0.5 block">
                    {formatDayDate(activeAssignment.dueDate)}
                  </span>
                </div>

                <div className="py-3 sm:px-4">
                  <span className="text-[11px] text-cw-faint block">Bobot</span>
                  <span className="text-xs font-semibold text-cw-ink mt-0.5 block">
                    Bobot {activeAssignment.weightScore}/5 ({activeAssignment.isMajor ? "Tugas besar" : "Tugas biasa"})
                  </span>
                </div>

                <div className="py-3 sm:pl-4">
                  <span className="text-[11px] text-cw-faint block">Pertanyaan bantuan</span>
                  <span className="text-xs font-semibold text-cw-accent mt-0.5 block">
                    {activeAssignment.helpRequestsCount} pertanyaan
                  </span>
                </div>
              </div>

              {/* Sub-topik */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-cw-muted block">
                  Sub-topik:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeAssignment.subtopics?.map((sub: string) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedAssignmentForHelp(activeAssignment);
                        setHelpModalOpen(true);
                      }}
                      type="button"
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-cw-sunken text-cw-ink hover:bg-cw-accent-soft hover:text-cw-accent transition-colors"
                    >
                      #{sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materi, Link Video & Diskusi Bantuan langsung di detail tugas */}
              <div className="pt-3 border-t border-cw-line space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cw-ink">
                    Materi &amp; Bantuan Video ({assignmentHelpRequests.length})
                  </span>
                  <Link
                    href="/help"
                    className="text-[11px] font-medium text-cw-accent hover:underline"
                  >
                    Buka semua di Bantuan Sebaya →
                  </Link>
                </div>

                {assignmentHelpRequests.length === 0 ? (
                  <div className="p-3 rounded-xl bg-cw-subtle border border-dashed border-cw-line flex items-center justify-between gap-3">
                    <p className="text-xs text-cw-muted">
                      Belum ada diskusi atau tautan video materi untuk tugas ini.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setSelectedAssignmentForHelp(activeAssignment);
                        setHelpModalOpen(true);
                      }}
                    >
                      Mulai diskusi
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignmentHelpRequests.map((req) => {
                      const videoResp = req.responses?.find(
                        (r) => r.responseType === "RECORDED_LINK"
                      );
                      const videoUrl = videoResp?.contentOrUrl.split("\n")[0]?.trim();

                      return (
                        <div
                          key={req.id}
                          className="p-3 rounded-xl border border-cw-line bg-cw-subtle/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Tag>#{req.subtopicLabel}</Tag>
                              <span className="text-[11px] text-cw-faint flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {req.responses?.length || 0} tanggapan
                              </span>
                            </div>
                            <p className="text-xs text-cw-ink line-clamp-1">
                              {req.questionDetail}
                            </p>
                            {videoUrl && videoUrl.startsWith("http") && (
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-cw-accent hover:underline font-medium"
                              >
                                <Video className="w-3 h-3" />
                                <span className="truncate max-w-[260px]">Tonton video materi</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="flex-shrink-0"
                            onClick={() => {
                              setSelectedHelpRequest(req);
                              setDrawerOpen(true);
                            }}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Tambah Link Video / Jawab</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* Panel Rekomendasi Geser Jadwal */}
          <DateMoveSolver
            candidates={data?.candidates || []}
            weekNumber={weekNumber}
            currentCollisionCount={data?.metric.collisionCount ?? 0}
            onProposalAccepted={fetchWeekData}
          />
        </div>
      </div>

      {/* Modal Bantuan */}
      {selectedAssignmentForHelp && (
        <HelpRequestModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          onSuccess={() => {
            fetchWeekData();
            showToast("Permintaan bantuan berhasil dikirim ke kelas!", "success");
          }}
          assignments={
            data?.assignments.map((a) => ({
              id: a.id,
              title: a.title,
              courseCode: a.courseCode,
              courseName: a.courseName,
              subtopics: a.subtopics,
              weekNumber: a.weekNumber,
            })) || []
          }
          preselectedAssignmentId={selectedAssignmentForHelp?.id}
        />
      )}

      {/* Drawer Tanggapan & Link Video */}
      <HelpResponseDrawer
        request={selectedHelpRequest}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={() => {
          if (activeAssignment?.id) {
            fetchAssignmentHelp(activeAssignment.id);
          }
          fetchWeekData();
        }}
      />
    </div>
  );
}
