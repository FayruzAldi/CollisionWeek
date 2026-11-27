"use client";

import React, { useEffect, useState } from "react";
import { MetricRing } from "@/components/ui/MetricRing";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { BarChart3, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { MascotBanner } from "@/components/MascotCommunicator";
import Image from "next/image";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
  const { role } = useRole();
  const isPrivileged = role === "ADMIN" || role === "LECTURER";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!isPrivileged) return;
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
    if (!isPrivileged) {
      setLoading(false);
      return;
    }
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
  }, [isPrivileged]);

  useEffect(() => {
    fetchAnalytics();
  }, [courseFilter, isPrivileged]);

  if (!isPrivileged) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-center">
        <div className="relative w-32 h-32">
          <Image
            src="/mascots/umk/stress.webp"
            alt="WIRA akses terbatas"
            fill
            className="object-contain drop-shadow-[5px_5px_0_rgba(18,20,26,0.16)]"
            unoptimized
          />
        </div>
        <div className="flex items-center gap-2 text-lg font-semibold text-cw-muted">
          <Lock className="w-5 h-5" strokeWidth={1.75} />
          <span>Halaman ini hanya untuk dosen dan admin</span>
        </div>
        <p className="text-sm text-cw-faint max-w-sm">
          Analitik kesulitan sub-topik tersedia bagi dosen pengampu dan admin program studi.
        </p>
      </div>
    );
  }

  const totalWritten = (data?.rankings || []).reduce((acc, r) => acc + (r.responseTypes?.written || 0), 0);
  const totalRecorded = (data?.rankings || []).reduce((acc, r) => acc + (r.responseTypes?.recorded || 0), 0);
  const totalSession = (data?.rankings || []).reduce((acc, r) => acc + (r.responseTypes?.session || 0), 0);
  const totalResponsesAll = Math.max(1, totalWritten + totalRecorded + totalSession);
  const chartData = (data?.rankings || []).slice(0, 7).map((r) => ({
    name: r.subtopic.length > 14 ? r.subtopic.slice(0, 14) + "…" : r.subtopic,
    Selesai: r.resolvedCount,
    Aktif: r.openCount + r.inProgressCount,
  }));

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

        <Select
          value={courseFilter}
          onChange={setCourseFilter}
          aria-label="Filter berdasarkan matkul"
          className="w-full sm:w-56 self-start sm:self-auto"
          options={[
            { value: "all", label: "Semua matkul" },
            ...coursesList.map((course) => ({
              value: course.id,
              label: `${course.courseCode} · ${course.courseName}`,
            })),
          ]}
        />
      </div>

      {/* Maskot Newsman: WIRA (UMK) */}
      <MascotBanner
        persona="umk"
        callout="ANALITIK KELAS!"
        pose={(data?.summary.criticalSubtopicsCount ?? 0) > 0 ? "calculating.webp" : "success.webp"}
        tone={(data?.summary.criticalSubtopicsCount ?? 0) > 0 ? "warning" : "success"}
        headline={
          (data?.summary.criticalSubtopicsCount ?? 0) > 0
            ? `Ditemukan ${data?.summary.criticalSubtopicsCount} sub-topik berisiko yang butuh review kelas`
            : "Seluruh sub-topik terpantau stabil dengan tingkat penyelesaian baik"
        }
        message={`Dari ${data?.summary.totalRequests ?? 0} pertanyaan mahasiswa, ${data?.summary.overallResolutionRate ?? 0}% telah terselesaikan dengan rata-rata respons pertama ${data?.summary.overallAvgFirstResponseHours ?? 0} jam.`}
      />

      {/* 4 Metrik sebagai Baris Tanpa Kartu Dipisah Hairline Vertikal */}
      <div className="py-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cw-line border-y border-cw-line">
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

      {/* Visualisasi Grafik & Distribusi Format Bantuan */}
      {!loading && data && data.rankings.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="cw-card p-5 lg:col-span-8 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-cw-ink">
                Grafik Pertanyaan per Sub-topik
              </h3>
              <p className="text-xs text-cw-muted mt-0.5">
                Perbandingan pertanyaan yang sudah selesai vs masih aktif di papan bantuan.
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #ECEEF3",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="Selesai" stackId="a" fill="#22A06B" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Aktif" stackId="a" fill="#5850EC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cw-card p-5 lg:col-span-4 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-cw-ink">
                Distribusi Format Bantuan
              </h3>
              <p className="text-xs text-cw-muted mt-0.5">
                Cara mahasiswa dan dosen menyelesaikan kendala materi.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                { label: "Panduan Tulisan", count: totalWritten, color: "bg-emerald-500" },
                { label: "Tautan Video / Rekaman", count: totalRecorded, color: "bg-cw-accent" },
                { label: "Sesi Diskusi 20 Menit", count: totalSession, color: "bg-amber-500" },
              ].map((item) => {
                const pct = Math.round((item.count / totalResponsesAll) * 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-cw-ink">{item.label}</span>
                      <span className="text-cw-muted tabular-nums">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-cw-sunken overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-cw-line text-[11px] text-cw-faint">
              Total tanggapan aktif: {totalWritten + totalRecorded + totalSession} kontribusi
            </div>
          </div>
        </section>
      )}

      {/* Peringkat Sub-topik */}
      <section className="space-y-4">
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
      </section>
    </div>
  );
}
