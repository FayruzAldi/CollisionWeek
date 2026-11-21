"use client";

import React, { useEffect, useState } from "react";
import { CircularProgressRing } from "@/components/CircularProgressRing";
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Academic Sub-topic Friction Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#5850EC]">
              Lecturer Insights (US-08)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates which assignment sub-topics cause the highest friction to guide review sessions and deadline pacing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Final Day Milestone #3: Export RPS Report
          </span>
        </div>
      </div>

      {/* KPI Cards (Image 1 style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="trenning-card p-4.5 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sub-topic Questions
          </p>
          <p className="text-2xl font-black text-slate-900">
            {data?.summary.totalRequests ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Tracked across 6 courses</span>
        </div>

        <div className="trenning-card p-4.5 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resolution Rate
          </p>
          <p className="text-2xl font-black text-emerald-600">
            {data?.summary.overallResolutionRate ?? 0}%
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {data?.summary.resolvedTotal ?? 0} resolved by peers
          </span>
        </div>

        <div className="trenning-card p-4.5 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Time to First Response
          </p>
          <p className="text-2xl font-black text-[#5850EC]">
            {data?.summary.overallAvgFirstResponseHours ?? 0} hours
          </p>
          <span className="text-[11px] text-slate-500">Target SLA: &lt; 24h</span>
        </div>

        <div className="trenning-card p-4.5 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            High Friction Topics
          </p>
          <p className="text-2xl font-black text-rose-600">
            {data?.summary.criticalSubtopicsCount ?? 0} Topics
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">
            Pedagogical review recommended
          </span>
        </div>
      </div>

      {/* Subtopic Density Ranking List */}
      <div className="trenning-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Sub-topic Inquiry Density Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by student question volume. Topics with resolution &lt; 60% are highlighted for faculty intervention.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#5850EC] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold">Aggregating Sub-topic Analytics...</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {data?.rankings.map((stat, idx) => {
              const isCritical = stat.severity === "CRITICAL";
              const isWarning = stat.severity === "WARNING";
              const barWidth = Math.max(15, Math.round((stat.totalRequests / maxRequests) * 100));

              return (
                <div
                  key={`${stat.courseCode}-${stat.subtopic}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical
                      ? "border-rose-200 bg-rose-50/40"
                      : isWarning
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: stat.courseColor || "#2563EB" }}
                        >
                          {stat.courseCode}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">
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
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? "bg-rose-600" : isWarning ? "bg-amber-500" : "bg-[#5850EC]"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>

                      {/* Recommendation text */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-bold">Pedagogical Recommendation: </strong>
                        {stat.recommendation}
                      </div>
                    </div>

                    {/* Stats ring / boxes */}
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs self-start lg:self-auto">
                      <div className="text-center px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Inquiries</span>
                        <span className="text-lg font-black text-slate-900">{stat.totalRequests}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <CircularProgressRing
                        value={stat.resolutionRate}
                        size={36}
                        strokeWidth={4}
                        color={stat.resolutionRate >= 60 ? "#10B981" : "#EF4444"}
                        label="Resolved"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
