"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HeatMapGrid } from "@/components/HeatMapGrid";
import { PastelIllustration } from "@/components/PastelIllustrations";
import { useModals } from "@/context/ModalContext";
import {
  AlertOctagon,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen,
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Section: "Continue Learning" Style Featured Crunch Cards (Matching Image 1) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Critical Crunch Weeks (Immediate Action Needed)
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              {data?.summary.flaggedWeeksCount || 2} Weeks Flagged
            </span>
          </div>

          <button
            onClick={openSolverModal}
            className="text-xs font-bold text-[#5850EC] hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Launch Heuristic Solver</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2 Wide Horizontal Featured Cards (Matching Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Week 8 */}
          <div className="trenning-card p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail Illustration (Image 1 style) */}
              <div className="w-full sm:w-44 h-28 rounded-2xl relative overflow-hidden flex-shrink-0 border border-slate-100">
                <PastelIllustration type="laptop" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                  Week 8 • 4 Major Tasks
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                    Midterm Collision (Cw = 4)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    IF2110, IF2120, IF2130, IF2150
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  Midterm Examination &amp; Major Project Crunch
                </h3>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Load Density:</span>
                    <span className="font-black text-rose-600">
                      {week8Metric?.loadIndex || 16} pts (Max Critical)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full w-[95%]"></div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    74% students report sleep deprivation
                  </span>
                  <Link
                    href="/weeks/8"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Inspect &amp; Shift
                  </Link>
                </div>
              </div>
            </div>

            {/* Sub-footer recommendation pill (Image 1 style) */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 bg-indigo-50/50 p-2 px-3 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#5850EC]" />
                <span className="truncate">
                  Optimal move: Shift Database Project to Week 9 (+1w) to reduce C to 3
                </span>
              </span>
              <Link href="/weeks/8" className="font-bold hover:underline flex-shrink-0 ml-2">
                Apply →
              </Link>
            </div>
          </div>

          {/* Card 2: Week 14 */}
          <div className="trenning-card p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail Illustration (Image 1 style) */}
              <div className="w-full sm:w-44 h-28 rounded-2xl relative overflow-hidden flex-shrink-0 border border-slate-100">
                <PastelIllustration type="notebook" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                  Week 14 • 3 Major Tasks
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    Pre-Final Collision (Cw = 3)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    IF2110, IF2120, IF2160
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  End-of-Semester Project Milestones Crunch
                </h3>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Load Density:</span>
                    <span className="font-black text-amber-600">
                      {week14Metric?.loadIndex || 14} pts (High Load)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full w-[80%]"></div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Pre-final submissions clash
                  </span>
                  <Link
                    href="/weeks/14"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Inspect &amp; Shift
                  </Link>
                </div>
              </div>
            </div>

            {/* Sub-footer recommendation pill (Image 1 style) */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 bg-indigo-50/50 p-2 px-3 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#5850EC]" />
                <span className="truncate">
                  Optimal move: Shift AI Project to Week 15 (+1w) to reduce C to 2
                </span>
              </span>
              <Link href="/weeks/14" className="font-bold hover:underline flex-shrink-0 ml-2">
                Apply →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section: "All Materials (27)" style (Image 1) -> 16-Week Semester Materials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              All Academic Weeks
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              16 Weeks
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Program: <strong>{data?.program.name || "Informatics Engineering (IF-ITB)"}</strong></span>
          </div>
        </div>

        {/* Heat Map Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-[#5850EC] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold">Computing Deterministic 16-Week Load...</p>
          </div>
        ) : (
          <HeatMapGrid metrics={data?.metrics || []} onOpenSolverModal={openSolverModal} />
        )}
      </section>
    </div>
  );
}
