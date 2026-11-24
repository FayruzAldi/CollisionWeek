"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DateMoveSolver } from "@/components/DateMoveSolver";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
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
  const weekNumber = parseInt(params.weekNumber as string, 10) || 8;
  const { showToast } = useToast();

  const [data, setData] = useState<WeekDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedAssignmentForHelp, setSelectedAssignmentForHelp] = useState<any | null>(null);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weeks/${weekNumber}`);
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
  }, [weekNumber]);

  const isCollision = (data?.metric.collisionCount ?? 0) >= 3;
  const isCaution = (data?.metric.collisionCount ?? 0) === 2;
  const activeAssignment = data?.assignments[selectedAssignmentIndex] || data?.assignments[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-2 border-b border-cw-line">
        <div className="flex items-center gap-1.5 text-xs text-cw-faint">
          <Link href="/" className="hover:text-cw-ink transition-colors">
            Dasbor
          </Link>
          <span>/</span>
          <span className="text-cw-ink font-medium">Pekan {weekNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
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

          {/* Pemilih Pekan 1-16 (kotak 28px, titik 4px untuk kritis) */}
          <div className="flex items-center gap-1 bg-cw-surface p-1 rounded-2xl border border-cw-line overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => router.push(`/weeks/${Math.max(1, weekNumber - 1)}`)}
              disabled={weekNumber <= 1}
              aria-label="Pekan sebelumnya"
              className="p-1 rounded-lg text-cw-faint hover:text-cw-ink disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
              const isCurrent = w === weekNumber;
              const isCriticalWeek = w === 6 || w === 10 || w === 14;

              return (
                <button
                  key={w}
                  onClick={() => router.push(`/weeks/${w}`)}
                  className={`w-7 h-7 rounded-xl text-xs font-semibold relative transition-colors ${
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
              className="p-1 rounded-lg text-cw-faint hover:text-cw-ink disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

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

          <div className="space-y-1.5">
            {data?.assignments.map((item, idx) => {
              const isSelected = selectedAssignmentIndex === idx;
              const isMajor = item.weightScore >= 3;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAssignmentIndex(idx)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-cw-accent-soft/40 border-cw-accent-line text-cw-ink"
                      : "bg-cw-surface border-cw-line hover:bg-cw-subtle text-cw-ink"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Tag>{item.courseCode}</Tag>
                    <span className="text-[11px] text-cw-faint font-medium">
                      {isMajor ? "Tugas besar · " : ""}Bobot {item.weightScore}/5
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs text-cw-ink truncate">
                    {idx + 1}. {item.title}
                  </h4>
                  <p className="text-[11px] text-cw-faint mt-0.5">
                    Tenggat: {formatDate(item.dueDate)} · {item.subtopics?.length || 0} sub-topik
                  </p>
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

        {/* Kolom Kanan: Rincian Tugas & Solver (col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {activeAssignment && (
            <div className="cw-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cw-line">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag>{activeAssignment.courseCode}</Tag>
                    <span className="text-xs text-cw-faint">
                      Dosen: {activeAssignment.lecturerName}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-cw-ink mt-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-cw-subtle border border-cw-line">
                  <span className="text-[11px] text-cw-faint block">Tenggat</span>
                  <span className="text-xs font-semibold text-cw-ink mt-0.5 block">
                    {formatDate(activeAssignment.dueDate)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cw-subtle border border-cw-line">
                  <span className="text-[11px] text-cw-faint block">Bobot</span>
                  <span className="text-xs font-semibold text-cw-ink mt-0.5 block">
                    Bobot {activeAssignment.weightScore}/5 ({activeAssignment.isMajor ? "Tugas besar" : "Tugas biasa"})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cw-subtle border border-cw-line">
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
            </div>
          )}

          {/* Panel Solver */}
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
    </div>
  );
}
