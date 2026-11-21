"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HeatMapGrid } from "@/components/HeatMapGrid";
import { PastelIllustration } from "@/components/PastelIllustrations";
import { useModals } from "@/context/ModalContext";
import {
  Zap,
  ChevronRight,
} from "lucide-react";

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
      console.error("Failed to load heatmap data:", err);
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Critical Crunch Weeks */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Critical Crunch Weeks
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
              {data?.summary.flaggedWeeksCount || 2} Flagged
            </span>
          </div>

          <button
            onClick={openSolverModal}
            className="text-xs font-semibold text-[#5850EC] hover:text-indigo-800 flex items-center gap-1 transition-colors active:scale-[0.98]"
          >
            <span>Launch Solver</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {loading ? (
          /* Skeleton — matches 2-col card layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white border border-[#E9ECF2] rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-44 h-28 rounded-2xl bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-100 rounded-full w-full" />
                    <div className="h-2 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2 Wide Horizontal Featured Cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Week 8 */}
            <div className="trenning-card p-5 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-44 h-28 rounded-2xl relative overflow-hidden flex-shrink-0 border border-slate-100">
                  <PastelIllustration type="laptop" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                    Week 8 · 4 Major Tasks
                  </div>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Midterm Collision (Cw = 4)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      IF2110, IF2120, IF2130, IF2150
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                    Midterm Examination &amp; Major Project Crunch
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Load Density</span>
                      <span className="font-bold text-rose-600">
                        {week8Metric?.loadIndex || 16} pts — Critical
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full w-[95%]"></div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">High student load clustering</span>
                    <Link
                      href="/weeks/8"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors active:scale-[0.98]"
                    >
                      Inspect &amp; Shift
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recommendation footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 bg-[#F4F5FF] border border-[#E0E3FC] p-2 px-3 rounded-xl">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#5850EC]" strokeWidth={2} />
                  <span className="truncate">
                    Optimal: Shift Database Project to Week 9 to reduce C to 3
                  </span>
                </span>
                <Link href="/weeks/8" className="font-bold hover:underline flex-shrink-0 ml-2 active:scale-[0.98]">
                  Apply →
                </Link>
              </div>
            </div>

            {/* Card 2: Week 14 */}
            <div className="trenning-card p-5 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-44 h-28 rounded-2xl relative overflow-hidden flex-shrink-0 border border-slate-100">
                  <PastelIllustration type="notebook" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                    Week 14 · 3 Major Tasks
                  </div>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Pre-Final Collision (Cw = 3)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      IF2110, IF2120, IF2160
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                    End-of-Semester Project Milestones Crunch
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Load Density</span>
                      <span className="font-bold text-amber-600">
                        {week14Metric?.loadIndex || 14} pts — High Load
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[80%]"></div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Pre-final submissions clash</span>
                    <Link
                      href="/weeks/14"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors active:scale-[0.98]"
                    >
                      Inspect &amp; Shift
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 bg-[#F4F5FF] border border-[#E0E3FC] p-2 px-3 rounded-xl">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#5850EC]" strokeWidth={2} />
                  <span className="truncate">
                    Optimal: Shift AI Project to Week 15 to reduce C to 2
                  </span>
                </span>
                <Link href="/weeks/14" className="font-bold hover:underline flex-shrink-0 ml-2 active:scale-[0.98]">
                  Apply →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 16-Week Academic Schedule */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              All Academic Weeks
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              16 Weeks
            </span>
          </div>

          <span className="text-xs text-slate-500">
            {data?.program.name || "Informatics Engineering (IF-ITB)"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E9ECF2] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-32 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <HeatMapGrid metrics={data?.metrics || []} onOpenSolverModal={openSolverModal} />
        )}
      </section>
    </div>
  );
}
