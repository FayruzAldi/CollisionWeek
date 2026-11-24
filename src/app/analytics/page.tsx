"use client";

import React, { useEffect, useState } from "react";
import { MetricRing } from "@/components/ui/MetricRing";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";

interface SubtopicStat {
  subtopic: string;
  courseCode: string;
  courseName: string;
  courseColor: string;
  totalRequests: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  avgResponseTimeHours: number | null;
  resolutionRate: number;
  recommendation: string;
  severity: "NORMAL" | "WARNING" | "CRITICAL";
  responseTypes: {
    written: number;
    recorded: number;
    session: number;
  };
}

interface AnalyticsData {
  summary: {
    totalRequests: number;
    resolvedTotal: number;
    overallResolutionRate: number;
    overallAvgFirstResponseHours: number;
    criticalSubtopicsCount: number;
  };
  rankings: SubtopicStat[];
}

export default function LecturerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const json = await res.json();
        setCoursesList(json.courses || []);
      }
    } catch (err) {
      console.error("Gagal memuat mata kuliah:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url =
        courseFilter !== "all"
          ? `/api/analytics/subtopics?courseId=${courseFilter}`
          : "/api/analytics/subtopics";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Gagal memuat analitik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [courseFilter]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-7">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cw-line">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
              Analitik Sub-topik
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cw-sunken text-cw-muted">
              Untuk dosen
            </span>
          </div>
          <p className="text-xs text-cw-muted mt-0.5">
            Menunjukkan sub-topik tugas yang paling sering menjadi kendala, untuk menentukan sesi review dan pengaturan tenggat.
          </p>
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          aria-label="Filter berdasarkan matkul"
          className="text-xs rounded-xl bg-cw-surface border border-cw-line px-3 py-1.5 text-cw-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 self-start sm:self-auto"
        >
          <option value="all">Semua matkul</option>
          {coursesList.map((c) => (
            <option key={c.courseCode} value={c.courseCode}>
              {c.courseCode} · {c.courseName}
            </option>
          ))}
        </select>
      </div>

      {/* 4 Metrik sebagai Baris Tanpa Kartu Dipisah Hairline Vertikal */}
      <div className="cw-card p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cw-line">
          {/* Metrik 1 */}
          <div className="p-4 sm:px-6 first:pl-0">
            <span className="text-[11px] font-medium text-cw-faint block">
              Total pertanyaan
            </span>
            <span className="text-[22px] font-semibold text-cw-ink tabular-nums block mt-0.5">
              {data?.summary.totalRequests ?? 0}
            </span>
            <span className="text-xs text-cw-muted mt-0.5 block">
              Dari 6 matkul
            </span>
          </div>

          {/* Metrik 2 */}
          <div className="p-4 sm:px-6">
            <span className="text-[11px] font-medium text-cw-faint block">
              Tingkat selesai
            </span>
            <span className="text-[22px] font-semibold text-semantic-success-fg tabular-nums block mt-0.5">
              {data?.summary.overallResolutionRate ?? 0}%
            </span>
            <span className="text-xs text-cw-muted mt-0.5 block">
              {data?.summary.resolvedTotal ?? 0} selesai lewat bantuan sebaya
            </span>
          </div>

          {/* Metrik 3 */}
          <div className="p-4 sm:px-6">
            <span className="text-[11px] font-medium text-cw-faint block">
              Respons pertama
            </span>
            <span className="text-[22px] font-semibold text-cw-ink tabular-nums block mt-0.5">
              {data?.summary.overallAvgFirstResponseHours ?? 0} jam
            </span>
            <span className="text-xs text-cw-muted mt-0.5 block">
              Target &lt; 24 jam
            </span>
          </div>

          {/* Metrik 4 */}
          <div className="p-4 sm:px-6 last:pr-0">
            <span className="text-[11px] font-medium text-cw-faint block">
              Topik berisiko
            </span>
            <span className="text-[22px] font-semibold text-semantic-danger-fg tabular-nums block mt-0.5">
              {data?.summary.criticalSubtopicsCount ?? 0}
            </span>
            <span className="text-xs text-cw-muted mt-0.5 block">
              Perlu sesi review
            </span>
          </div>
        </div>
      </div>

      {/* Peringkat Sub-topik */}
      <div className="cw-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Peringkat sub-topik
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Diurutkan dari jumlah pertanyaan. Sub-topik dengan tingkat selesai di bawah 60% ditandai.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3.5 cw-hairline space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        ) : !data?.rankings.length ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada data analitik"
            description="Pertanyaan bantuan sebaya yang diajukan mahasiswa akan teragregasi di sini."
          />
        ) : (
          <div className="divide-y divide-cw-line">
            {data.rankings.map((stat, idx) => {
              const isCritical = stat.severity === "CRITICAL";
              const isExpanded = expandedTopic === `${stat.courseCode}-${stat.subtopic}`;

              return (
                <div
                  key={`${stat.courseCode}-${stat.subtopic}`}
                  className="py-3.5 first:pt-1 last:pb-1 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-semibold text-cw-faint w-5 text-right tabular-nums">
                        #{idx + 1}
                      </span>
                      <Tag>{stat.courseCode}</Tag>
                      <h4 className="text-[13px] font-semibold text-cw-ink truncate">
                        {stat.subtopic}
                      </h4>
                      {isCritical && (
                        <Badge variant="danger" shape="pill">
                          Berisiko
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-cw-faint block">Pertanyaan</span>
                        <span className="text-xs font-semibold text-cw-ink tabular-nums">
                          {stat.totalRequests}
                        </span>
                      </div>

                      <div className="w-24">
                        <MetricRing
                          value={stat.resolutionRate}
                          max={100}
                          label="Selesai"
                          unit="%"
                          tone={stat.resolutionRate >= 60 ? "success" : "danger"}
                          size={28}
                        />
                      </div>

                      {stat.recommendation && (
                        <button
                          onClick={() =>
                            setExpandedTopic(
                              isExpanded ? null : `${stat.courseCode}-${stat.subtopic}`
                            )
                          }
                          type="button"
                          aria-label="Lihat saran pedagogis"
                          className="p-1 rounded-lg text-cw-faint hover:text-cw-ink hover:bg-cw-sunken transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
                          ) : (
                            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Saran pedagogis (disclosure) */}
                  {isExpanded && stat.recommendation && (
                    <div className="p-3 rounded-xl bg-cw-subtle border border-cw-line text-xs text-cw-muted leading-relaxed">
                      <strong className="text-cw-ink font-semibold">Saran: </strong>
                      {stat.recommendation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
