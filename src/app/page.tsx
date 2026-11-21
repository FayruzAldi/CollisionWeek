"use client";

import React, { useEffect, useState } from "react";
import { HeatMapGrid } from "@/components/HeatMapGrid";
import { WideWeekCard } from "@/components/WideWeekCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useModals } from "@/context/ModalContext";

interface HeatMapData {
  program: {
    id: string;
    code: string;
    name: string;
    semesterStartDate: string;
    totalWeeks: number;
  };
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
  const [loading, setLoading] = useState(true);
  const { openSolverModal } = useModals();

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/metrics/heatmap");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Gagal memuat data peta beban:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const week8Metric = data?.metrics.find((m) => m.weekNumber === 8);
  const week14Metric = data?.metrics.find((m) => m.weekNumber === 14);

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

        <p className="text-xs text-cw-muted">
          Program: <span className="font-semibold text-cw-ink">{data?.program.name || "Teknik Informatika"}</span>
        </p>
      </div>

      {/* 2. Seksi Pekan Paling Padat */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-cw-ink">
              Pekan Paling Padat
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-danger-soft text-semantic-danger-fg">
              {data?.summary.flaggedWeeksCount || 2} pekan kritis
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={openSolverModal} type="button">
            <span>Buka solver</span>
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
            {/* Kartu 1: Pekan 8 */}
            <WideWeekCard
              weekNumber={8}
              title="Ujian Tengah Semester & Tenggat Proyek Besar"
              collisionCount={week8Metric?.collisionCount || 4}
              loadIndex={week8Metric?.loadIndex || 16}
              courses={week8Metric?.courses || ["IF2110", "IF2120", "IF2130", "IF2150"]}
              recommendation="Optimal: geser Proyek Basis Data ke Pekan 9 agar Cw turun ke 3"
              palette="koral"
              illustrationType="laptop"
            />

            {/* Kartu 2: Pekan 14 */}
            <WideWeekCard
              weekNumber={14}
              title="Tenggat Proyek Akhir Semester"
              collisionCount={week14Metric?.collisionCount || 3}
              loadIndex={week14Metric?.loadIndex || 14}
              courses={week14Metric?.courses || ["IF2110", "IF2120", "IF2160"]}
              recommendation="Optimal: geser Proyek AI ke Pekan 15 agar Cw turun ke 2"
              palette="pasir"
              illustrationType="notebook"
            />
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
              (Semester Ganjil 2026/2027)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <HeatMapGrid metrics={data?.metrics || []} onOpenSolverModal={openSolverModal} />
        )}
      </section>
    </div>
  );
}
