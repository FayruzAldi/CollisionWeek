"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HeatMapGrid } from "@/components/HeatMapGrid";
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

  const flaggedWeeks = data?.metrics.filter((m) => m.isFlagged) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            GDGoC ITB STACK 2026 Semifinal Baseline
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Academic Deadline Load Balancing &amp; Sub-topic Peer Help
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminates multi-course assignment clustering (<strong>74%</strong> of students experience
            ≥3 major deadlines in a single week) through pure <strong>deterministic algorithms</strong>,
            pairing peak load weeks with hyper-targeted sub-topic peer unblocking.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/weeks/8"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Inspect Week 8 Collision Crunch (C = 4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/help"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Browse Sub-topic Peer Help Board</span>
            </Link>

            <Link
              href="/about"
              className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/60 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Empirical Survey (53 Students)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards (PRD Section 1.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Flagged Collision Weeks
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">
                {data?.summary.flaggedWeeksCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">of 16 weeks</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Weeks with C<sub>w</sub> ≥ 3 major tasks
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Peak Load Index (L<sub>w</sub>)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">
                {data?.summary.peakLoadIndex ?? 0}
              </span>
              <span className="text-xs text-slate-500">pts (Avg: {data?.summary.avgLoadIndex ?? 0})</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Max aggregated difficulty weight
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Peer Help Needs
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-600">5</span>
              <span className="text-xs text-rose-600 font-semibold">• 1 Urgent (&gt;12h)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sub-topic requests with whole-class visibility
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time to First Response
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">&lt; 4.2 h</span>
              <span className="text-xs text-emerald-600 font-semibold">SLA: &lt; 24h</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Resolution loop: 75% resolved
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* High-priority flagged week alert card */}
      {flaggedWeeks.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-rose-950 text-sm">
                Collision Week Alert: {flaggedWeeks.length} Flagged Academic Weeks Detected
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                {flaggedWeeks.map((f) => `Week ${f.weekNumber} (Cw = ${f.collisionCount})`).join(" & ")} exceed the safe limit of 2 major assignments per week.
                The deterministic engine has calculated minimal date moves to restore equilibrium.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/weeks/${flaggedWeeks[0].weekNumber}`}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Balance Week {flaggedWeeks[0].weekNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Heat Map Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              16-Week Semester Heat Map
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Program: <strong>{data?.program.name || "Informatics Engineering (IF-ITB)"}</strong> • Click any card to inspect colliding assignments &amp; simulate date moves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Precomputed Response: &lt; 300ms SLA
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-semibold">Calculating 16-Week Deterministic Load...</p>
          </div>
        ) : (
          <HeatMapGrid metrics={data?.metrics || []} />
        )}
      </section>
    </div>
  );
}
