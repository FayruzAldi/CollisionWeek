"use client";

import React, { useEffect, useState } from "react";
import { HeatMapGrid } from "@/components/HeatMapGrid";
import { WideWeekCard } from "@/components/WideWeekCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useModals } from "@/context/ModalContext";
import { useRole } from "@/context/RoleContext";
import { MascotBanner } from "@/components/MascotCommunicator";

interface HeatMapData {
  program: {
    id: string;
    code: string;
    name: string;
    semesterStartDate: string;
    totalWeeks: number;
  };
  programs?: { id: string; code: string; name: string }[];
  metrics: any[];
  summary: {
    totalWeeks: number;
    flaggedWeeksCount: number;
    peakLoadIndex: number;
    avgLoadIndex: number;
  };
}

export default function HomePage() {
  const [data, setData] = useState<HeatMapData | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { openSolverModal } = useModals();
  const { role, currentUser } = useRole();

  const fetchHeatmap = async (programId?: string) => {
    try {
      setLoading(true);
      const url = programId
        ? `/api/metrics/heatmap?programId=${encodeURIComponent(programId)}`
        : "/api/metrics/heatmap";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!programId && json?.program?.id) {
          setSelectedProgramId(json.program.id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data peta beban:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedProgramId("");
  }, [currentUser?.id]);

  useEffect(() => {
    fetchHeatmap(role === "ADMIN" ? selectedProgramId || undefined : undefined);
  }, [selectedProgramId, currentUser?.id, role]);

  const flaggedMetrics = (data?.metrics || [])
    .filter((m) => m.isFlagged || m.collisionCount >= 3)
    .sort((a, b) => b.collisionCount - a.collisionCount);

  const card1 = flaggedMetrics[0] || data?.metrics.find((m) => m.weekNumber === 10) || data?.metrics[0];
  const card2 = flaggedMetrics[1] || data?.metrics.find((m) => m.weekNumber === 14) || data?.metrics[1];

  const getWeekTitle = (weekNum: number) => {
    if (weekNum === 6) return "Penumpukan Tugas Tengah Semester";
    if (weekNum === 10) return "Pekan Puncak Proyek & Tugas Besar";
    if (weekNum === 14) return "Tenggat Proyek Akhir Semester";
    if (weekNum === 8) return "Ujian Tengah Semester";
    if (weekNum === 16) return "Ujian Akhir Semester";
    return `Jadwal Akademik Pekan ${weekNum}`;
  };

  const getRecommendation = (metric: any) => {
    if (!metric) return "Jalankan solver deterministik untuk menyeimbangkan beban pekan";
    const firstCourse = metric.courses?.[0];
    if (metric.collisionCount >= 3 && firstCourse) {
      return `Optimal: geser tugas ${firstCourse} ke Pekan ${Math.min(16, metric.weekNumber + 1)} agar bentrok berkurang`;
    }
    return "Lihat rincian tugas dan rekomendasi pergeseran pekan";
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-7">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-cw-line">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
            Peta Beban Semester
          </h2>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cw-sunken text-cw-muted">
            {data?.summary.totalWeeks || 16} pekan
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-cw-muted">
          <span>Jurusan:</span>
          {role === "ADMIN" && data?.programs && data.programs.length > 1 ? (
            <select
              aria-label="Pilih jurusan"
              value={selectedProgramId || data.program.id}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="rounded-lg border border-cw-line bg-cw-surface px-2.5 py-1 text-xs font-semibold text-cw-ink focus:outline-none focus:ring-2 focus:ring-cw-accent/40"
            >
              {data.programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-cw-ink">
              {data?.program.name || currentUser?.program?.name || "Memuat..."}
            </span>
          )}
        </div>
      </div>

      {/* Maskot Newsman / Announcer: WIRA (UMK) */}
      {!loading && data && (
        <MascotBanner
          persona="umk"
          callout={(data.summary.flaggedWeeksCount || 0) > 0 ? "SIAGA PEKAN!" : "TERBANG TINGGI!"}
          pose={(data.summary.flaggedWeeksCount || 0) > 0 ? "stress.webp" : "success.webp"}
          tone={(data.summary.flaggedWeeksCount || 0) > 0 ? "warning" : "success"}
          headline={
            (data.summary.flaggedWeeksCount || 0) > 0
              ? `Buletin ${data.program.name}: ${data.summary.flaggedWeeksCount} pekan kritis terdeteksi`
              : `Buletin ${data.program.name}: seluruh pekan dalam kondisi seimbang`
          }
          message={
            (data.summary.flaggedWeeksCount || 0) > 0
              ? `Beban tertinggi mencapai ${data.summary.peakLoadIndex} poin di Pekan ${card1?.weekNumber || 10}. Klik untuk meninjau rincian tugas atau menyeimbangkan jadwal.`
              : "Tidak ada penumpukan 3 tugas besar bersamaan di pekan yang sama."
          }
          actionLabel={(data.summary.flaggedWeeksCount || 0) > 0 ? "Tinjau Pekan Kritis" : undefined}
          actionHref={
            (data.summary.flaggedWeeksCount || 0) > 0
              ? `/weeks/${card1?.weekNumber || 10}${role === "ADMIN" && selectedProgramId ? `?programId=${selectedProgramId}` : ""}`
              : undefined
          }
        />
      )}

      {/* Ringkasan Eksekusi Semester (gaya KPI Trenning) */}
      {!loading && data && (
        <div className="cw-card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-cw-line">
          <div className="p-4 sm:px-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-cw-faint block">Total Pekan Dipantau</span>
              <span className="text-xl font-semibold text-cw-ink tabular-nums mt-0.5 block">
                {data.summary.totalWeeks} pekan
              </span>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-cw-subtle border border-cw-line text-cw-muted">
              1 Semester
            </span>
          </div>

          <div className="p-4 sm:px-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-cw-faint block">Pekan Kritis (Cw ≥ 3)</span>
              <span
                className={`text-xl font-semibold tabular-nums mt-0.5 block ${
                  data.summary.flaggedWeeksCount > 0 ? "text-semantic-danger-fg" : "text-semantic-success-fg"
                }`}
              >
                {data.summary.flaggedWeeksCount} pekan
              </span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                data.summary.flaggedWeeksCount > 0 ? "bg-semantic-danger-ring" : "bg-semantic-success-ring"
              }`}
            />
          </div>

          <div className="p-4 sm:px-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-cw-faint block">Beban Puncak &amp; Rata-rata</span>
              <span className="text-xl font-semibold text-cw-ink tabular-nums mt-0.5 block">
                {data.summary.peakLoadIndex} <span className="text-xs font-normal text-cw-muted">poin puncak · rata-rata {data.summary.avgLoadIndex}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Seksi Pekan Paling Padat */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-cw-ink">
              Pekan Paling Padat
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-danger-soft text-semantic-danger-fg">
              {data?.summary.flaggedWeeksCount || 3} pekan kritis
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={openSolverModal} type="button">
            <span>{role === "STUDENT" ? "Ajukan geser tanggal" : "Buka solver"}</span>
            <span>→</span>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {card1 && (
              <WideWeekCard
                weekNumber={card1.weekNumber}
                title={getWeekTitle(card1.weekNumber)}
                collisionCount={card1.collisionCount}
                loadIndex={card1.loadIndex}
                courses={card1.courses || []}
                recommendation={getRecommendation(card1)}
                palette="koral"
                illustrationType="laptop"
                programQuery={role === "ADMIN" && selectedProgramId ? `?programId=${selectedProgramId}` : ""}
              />
            )}

            {card2 && (
              <WideWeekCard
                weekNumber={card2.weekNumber}
                title={getWeekTitle(card2.weekNumber)}
                collisionCount={card2.collisionCount}
                loadIndex={card2.loadIndex}
                courses={card2.courses || []}
                recommendation={getRecommendation(card2)}
                palette="pasir"
                illustrationType="notebook"
                programQuery={role === "ADMIN" && selectedProgramId ? `?programId=${selectedProgramId}` : ""}
              />
            )}
          </div>
        )}
      </section>

      {/* 3. Seksi Semua Pekan */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-cw-ink">
              Semua Pekan
            </h3>
            <span className="text-xs text-cw-faint">
              (Semester Genap 2026/2027)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <HeatMapGrid
            metrics={data?.metrics || []}
            onOpenSolverModal={openSolverModal}
            programQuery={role === "ADMIN" && selectedProgramId ? `?programId=${selectedProgramId}` : ""}
          />
        )}
      </section>
    </div>
  );
}
