"use client";

import React, { useEffect, useState } from "react";
import { HelpRequestData } from "@/lib/types";
import { HelpResponseDrawer } from "@/components/HelpResponseDrawer";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import {
  PastelIllustration,
  PALETTE_LIST,
  IllustrationType,
  getTopicImage,
} from "@/components/PastelIllustrations";
import { MascotBanner } from "@/components/MascotCommunicator";
import { formatDateTime } from "@/lib/utils";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Search,
  Plus,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Video,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function PeerHelpBoardPage() {
  const [requests, setRequests] = useState<HelpRequestData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    needsHelpUrgent: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState<any[]>([]);
  const { showToast } = useToast();

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCourse !== "all") params.set("courseId", selectedCourse);
      if (activeFilter !== "all") params.set("filter", activeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/help-requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Gagal memuat bantuan sebaya:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndAssignments = async () => {
    try {
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }

      const week8Res = await fetch("/api/weeks/8");
      if (week8Res.ok) {
        const wData = await week8Res.json();
        setAssignmentOptions(wData.assignments || []);
      }
    } catch (err) {
      console.error("Gagal memuat data pendukung:", err);
    }
  };

  useEffect(() => {
    fetchCoursesAndAssignments();
  }, []);

  useEffect(() => {
    fetchHelpRequests();
  }, [selectedCourse, activeFilter]);

  const illTypes: IllustrationType[] = ["laptop", "notebook", "analytics", "document"];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cw-line">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
              Bantuan Sebaya
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cw-sunken text-cw-muted">
              {stats.total} pertanyaan
            </span>
          </div>
          <p className="text-xs text-cw-muted mt-0.5">
            Bantuan dari teman sekelas untuk sub-topik tertentu, lewat tulisan, rekaman, atau sesi 20 menit.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Minta bantuan</span>
        </Button>
      </div>

      {/* Maskot Companion: PUTI (Telkom) */}
      <MascotBanner
        persona="telkom"
        callout={stats.needsHelpUrgent > 0 ? "BUTUH BANTUAN!" : "SALING BANTU!"}
        pose={stats.needsHelpUrgent > 0 ? "peer-help.webp" : "sharing.webp"}
        tone={stats.needsHelpUrgent > 0 ? "warning" : "default"}
        headline={
          stats.needsHelpUrgent > 0
            ? `${stats.needsHelpUrgent} pertanyaan temanmu sudah menunggu lebih dari 12 jam`
            : "Ruang belajar kolaboratif antar mahasiswa"
        }
        message={
          stats.needsHelpUrgent > 0
            ? "Punya catatan, tautan video tutorial, atau waktu 20 menit? Bantu mereka sekarang di papan diskusi."
            : "Bagikan tautan video penjelasan, panduan tertulis, atau ajukan sesi 20 menit untuk sub-topik yang menantang."
        }
        actionLabel={stats.needsHelpUrgent > 0 ? "Filter mendesak" : "Minta bantuan"}
        onActionClick={() =>
          stats.needsHelpUrgent > 0 ? setActiveFilter("needs_help") : setIsModalOpen(true)
        }
      />

      {/* Toolbar Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Pill active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
            Semua ({stats.total})
          </Pill>
          <Pill active={activeFilter === "needs_help"} onClick={() => setActiveFilter("needs_help")}>
            Butuh bantuan (&gt;12 jam) ({stats.needsHelpUrgent})
          </Pill>
          <Pill active={activeFilter === "in_progress"} onClick={() => setActiveFilter("in_progress")}>
            Sedang dibahas ({stats.inProgress})
          </Pill>
          <Pill active={activeFilter === "resolved"} onClick={() => setActiveFilter("resolved")}>
            Selesai ({stats.resolved})
          </Pill>
        </div>

        {/* Cari & Filter Matkul */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-cw-faint absolute left-3 top-2.5" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Cari sub-topik"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchHelpRequests()}
              className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line pl-8 pr-3 py-1.5 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
            />
          </div>

          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            aria-label="Pilih matkul"
            className="w-44 sm:w-56"
            options={[
              { value: "all", label: "Semua matkul" },
              ...courses.map((course) => ({
                value: course.id,
                label: `${course.courseCode} · ${course.courseName}`,
              })),
            ]}
          />
        </div>
      </div>

      {/* Grid Kartu Bantuan */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Belum ada permintaan pada filter ini"
          description="Jadilah yang pertama bertanya tentang tugas yang sedang kamu kerjakan."
          actionLabel="Minta bantuan sekarang"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((r, i) => {
            const isResolved = r.status === "RESOLVED";
            const illType = illTypes[i % illTypes.length];
            const palette = isResolved ? "mint" : PALETTE_LIST[i % PALETTE_LIST.length];

            const responses = r.responses || [];
            const recordedResp = responses.find((resp) => resp.responseType === "RECORDED_LINK");
            const hasSession = responses.some((resp) => resp.responseType === "SESSION_20MIN");
            const hasWritten = responses.some((resp) => resp.responseType === "WRITTEN");
            const recordedUrl = recordedResp?.contentOrUrl.split("\n")[0]?.trim();

            return (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRequest(r);
                  setIsDrawerOpen(true);
                }}
                className="cw-card group overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Banner Foto Materi gaya Trenning (inset rounded-xl + frosted pill) */}
                  <div className="p-2.5 pb-0">
                    <div className="h-28 w-full relative overflow-hidden rounded-xl">
                      <PastelIllustration
                        type={illType}
                        palette={palette}
                        imageSrc={getTopicImage(
                          `${r.assignment.course.courseCode} ${r.assignment.course.courseName} ${r.subtopicLabel}`,
                          i
                        )}
                      />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="bg-slate-900/75 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md">
                          {r.assignment.course.courseCode} · Pekan {r.assignment.weekNumber}
                        </span>
                      </div>

                      {r.isUrgent && !isResolved ? (
                        <div className="absolute top-2.5 right-2.5">
                          <Badge variant="danger" shape="pill">
                            Butuh bantuan (&gt;12 jam)
                          </Badge>
                        </div>
                      ) : isResolved ? (
                        <div className="absolute top-2.5 right-2.5">
                          <Badge variant="success" shape="pill">
                            Selesai
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Badan Kartu */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Tag>#{r.subtopicLabel}</Tag>
                      <span className="text-[11px] text-cw-faint truncate">
                        {r.assignment.course.courseName}
                      </span>
                    </div>

                    <h3 className="font-semibold text-cw-ink text-[15px] leading-snug line-clamp-1 group-hover:text-cw-accent transition-colors">
                      {r.assignment.title}
                    </h3>

                    <p className="text-xs text-cw-muted line-clamp-2 leading-relaxed">
                      {r.questionDetail}
                    </p>

                    {/* Ringkasan format materi bantuan (Video / Sesi / Tulisan) */}
                    {responses.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {recordedResp && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                            <Video className="w-3 h-3" strokeWidth={1.75} />
                            <span>Video / Tautan</span>
                          </span>
                        )}
                        {hasSession && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
                            <Clock className="w-3 h-3" strokeWidth={1.75} />
                            <span>Sesi 20 Menit</span>
                          </span>
                        )}
                        {hasWritten && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                            <FileText className="w-3 h-3" strokeWidth={1.75} />
                            <span>Panduan Tulisan</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tautan video cepat jika tersedia */}
                    {recordedUrl && recordedUrl.startsWith("http") && (
                      <a
                        href={recordedUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-cw-subtle border border-cw-line text-[11px] text-cw-accent hover:bg-cw-accent-soft/50 transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5 font-medium truncate">
                          <Video className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          <span className="truncate">{recordedUrl}</span>
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
                      </a>
                    )}

                    {/* Baris Meta */}
                    <div className="pt-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <UserAvatar
                          src={r.requester.avatarUrl}
                          name={r.requester.name}
                          size="xs"
                          shape="circle"
                        />
                        <span className="text-xs text-cw-muted font-medium truncate max-w-[130px]">
                          {r.requester.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-cw-muted font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-cw-faint" strokeWidth={1.75} />
                        <span>{r.responsesCount || responses.length || 0} tanggapan</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Kartu */}
                <div className="p-3.5 px-4 cw-hairline flex items-center justify-between text-xs">
                  <span className="text-[11px] text-cw-faint">
                    {formatDateTime(r.createdAt)}
                  </span>
                  <button
                    type="button"
                    className="font-semibold text-cw-accent hover:underline flex items-center gap-1"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer Respons */}
      <HelpResponseDrawer
        request={selectedRequest}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedRequest(null);
        }}
        onUpdated={() => {
          fetchHelpRequests();
          if (selectedRequest) {
            fetch(`/api/assignments/${selectedRequest.assignmentId}/help`)
              .then((r) => r.json())
              .then((d) => {
                const refreshed = d.helpRequests?.find(
                  (hr: any) => hr.id === selectedRequest.id
                );
                if (refreshed) {
                  setSelectedRequest({
                    ...refreshed,
                    assignment: {
                      ...d.assignment,
                      course: d.assignment.course,
                    },
                  });
                }
              })
              .catch(console.error);
          }
        }}
      />

      {/* Modal Permintaan Bantuan Baru */}
      <HelpRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchHelpRequests();
          showToast("Permintaan bantuan berhasil diajukan!", "success");
        }}
        assignments={assignmentOptions}
      />
    </div>
  );
}
