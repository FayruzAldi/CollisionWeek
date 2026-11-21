"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  Download,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";

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
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [courseFilter]);

  const maxRequests = Math.max(...(data?.rankings.map((r) => r.totalRequests) || [1]), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
            Lecturer Insights &amp; Course Evaluation Dashboard (US-08)
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Academic Sub-topic Bottlenecks
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Provides lecturers with actionable quantitative visibility into which sub-topics
            trigger the highest density of student help inquiries. Evaluates syllabus friction
            points to guide review sessions or deadline pacing.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Final Day Milestone #3: Export RPS Revision Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Sub-topic Inquiries
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {data?.summary.totalRequests ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Student questions tracked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Resolution Rate
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {data?.summary.overallResolutionRate ?? 0}%
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {data?.summary.resolvedTotal ?? 0} resolved by peers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Time to First Response
          </p>
          <p className="text-2xl font-black text-sky-600 mt-1">
            {data?.summary.overallAvgFirstResponseHours ?? 0} hours
          </p>
          <span className="text-[11px] text-slate-500">Target SLA: &lt; 24h</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            High-Friction Bottlenecks
          </p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {data?.summary.criticalSubtopicsCount ?? 0} Sub-topics
          </p>
          <span className="text-[11px] text-rose-600 font-medium">
            Require lecturer intervention
          </span>
        </div>
      </div>

      {/* Subtopics Rankings Table & Visual Bars */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              Sub-topic Inquiry Density Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by volume of student inquiries. Highlighted in red if resolution &lt; 60%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Class Visibility: Active</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-semibold">Aggregating Sub-topic Analytics...</p>
          </div>
        ) : data?.rankings.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No sub-topic inquiry data available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.rankings.map((stat, idx) => {
              const isCritical = stat.severity === "CRITICAL";
              const isWarning = stat.severity === "WARNING";
              const barWidth = Math.max(12, Math.round((stat.totalRequests / maxRequests) * 100));

              return (
                <div
                  key={`${stat.courseCode}-${stat.subtopic}`}
                  className={`p-4.5 rounded-xl border transition-all ${
                    isCritical
                      ? "border-rose-200 bg-rose-50/40"
                      : isWarning
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: stat.courseColor || "#2563eb" }}
                        >
                          {stat.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {stat.subtopic}
                        </h4>
                        {isCritical && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                            <ShieldAlert className="w-3 h-3" />
                            High Friction
                          </span>
                        )}
                      </div>

                      {/* Bar indicator */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical
                                ? "bg-rose-600"
                                : isWarning
                                ? "bg-amber-500"
                                : "bg-sky-500"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Recommendation Box */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Pedagogical Recommendation: </strong>
                        {stat.recommendation}
                      </div>
                    </div>

                    {/* Right: Stats Summary */}
                    <div className="flex items-center gap-4 text-xs self-start lg:self-auto bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Requests
                        </span>
                        <span className="text-lg font-black text-slate-800">
                          {stat.totalRequests}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Resolved
                        </span>
                        <span className="text-lg font-black text-emerald-600">
                          {stat.resolutionRate}%
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Avg Response
                        </span>
                        <span className="text-lg font-black text-sky-600">
                          {stat.avgResponseTimeHours !== null ? `${stat.avgResponseTimeHours}h` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Planned Final Day Milestone #3 Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
            Final Day Milestone #3
          </span>
          <h4 className="font-bold text-white text-base mt-1">
            Automated RPS Revision &amp; Academic Workload PDF Report
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Reserved for Final Day live build: automatically synthesizes semester-end sub-topic friction data into accredited curriculum review reports for faculty departments.
          </p>
        </div>

        <button
          disabled
          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-not-allowed opacity-80 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Planned for Final Day</span>
        </button>
      </div>
    </div>
  );
}
