"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

interface WeeklyMetricItem {
  id: string;
  weekNumber: number;
  loadIndex: number;
  collisionCount: number;
  isFlagged: boolean;
  totalAssignments: number;
  majorAssignmentsCount: number;
  courses: string[];
  assignmentsSummary: {
    id: string;
    courseCode: string;
    color?: string | null;
    weightScore: number;
  }[];
}

interface HeatMapGridProps {
  metrics: WeeklyMetricItem[];
  onSelectWeek?: (weekNumber: number) => void;
  selectedWeek?: number | null;
}

export function HeatMapGrid({
  metrics,
  onSelectWeek,
  selectedWeek,
}: HeatMapGridProps) {
  const [filter, setFilter] = useState<"ALL" | "FLAGGED" | "CAUTION" | "SAFE">("ALL");

  const filteredMetrics = metrics.filter((m) => {
    if (filter === "FLAGGED") return m.collisionCount >= 3;
    if (filter === "CAUTION") return m.collisionCount === 2;
    if (filter === "SAFE") return m.collisionCount <= 1;
    return true;
  });

  // Calculate highest load index for relative bar height
  const maxLoad = Math.max(...metrics.map((m) => m.loadIndex), 1);

  return (
    <div className="space-y-6">
      {/* Legend & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Deterministic Load Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">
              Safe Zone (<strong className="text-emerald-700">C<sub>w</sub> ≤ 1</strong>)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">
              Caution Zone (<strong className="text-amber-700">C<sub>w</sub> = 2</strong>)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-slate-600">
              Collision Zone (<strong className="text-rose-700">C<sub>w</sub> ≥ 3</strong>)
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
          {(["ALL", "FLAGGED", "CAUTION", "SAFE"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === mode
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode === "ALL"
                ? "All 16 Weeks"
                : mode === "FLAGGED"
                ? "Collisions Only (≥3)"
                : mode === "CAUTION"
                ? "Caution (2)"
                : "Safe (≤1)"}
            </button>
          ))}
        </div>
      </div>

      {/* 16-Week Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {filteredMetrics.map((item) => {
          const isCollision = item.collisionCount >= 3;
          const isCaution = item.collisionCount === 2;
          const isSafe = item.collisionCount <= 1;
          const isSelected = selectedWeek === item.weekNumber;

          // Theme styling based on deterministic collision rules
          const borderStyle = isCollision
            ? "border-rose-400 bg-gradient-to-b from-rose-50/70 to-white hover:border-rose-500 shadow-rose-100"
            : isCaution
            ? "border-amber-300 bg-gradient-to-b from-amber-50/40 to-white hover:border-amber-400 shadow-amber-50"
            : "border-slate-200 bg-white hover:border-emerald-300 shadow-slate-50";

          const badgeBg = isCollision
            ? "bg-rose-600 text-white shadow-xs"
            : isCaution
            ? "bg-amber-100 text-amber-800 border border-amber-200"
            : "bg-emerald-100 text-emerald-800 border border-emerald-200";

          const loadPercent = Math.min(100, Math.round((item.loadIndex / maxLoad) * 100));

          return (
            <div
              key={item.weekNumber}
              onClick={() => onSelectWeek && onSelectWeek(item.weekNumber)}
              className={`relative rounded-xl border p-4.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${borderStyle} ${
                isSelected ? "ring-2 ring-blue-600 ring-offset-2" : ""
              }`}
            >
              {/* Header: Week number & Collision Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">
                    Week {item.weekNumber}
                  </span>
                  {item.weekNumber === 8 && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      Midterms
                    </span>
                  )}
                  {item.weekNumber === 16 && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      Finals
                    </span>
                  )}
                </div>

                <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${badgeBg}`}>
                  {isCollision ? (
                    <>
                      <AlertOctagon className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>C<sub>w</sub> = {item.collisionCount}</span>
                    </>
                  ) : isCaution ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>C<sub>w</sub> = {item.collisionCount}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>C<sub>w</sub> = {item.collisionCount}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Warning label if Collision Week */}
              {isCollision && (
                <div className="mb-2.5 px-2 py-1 rounded-md bg-rose-100/90 border border-rose-300 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                  COLLISION WEEK DETECTED
                </div>
              )}

              {/* Load Index and visual progress */}
              <div className="space-y-1.5 mb-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Load Index (L<sub>w</sub>):</span>
                  <span className="font-bold text-slate-800 text-sm">{item.loadIndex} pts</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCollision
                        ? "bg-rose-600"
                        : isCaution
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Assignments Breakdown */}
              <div className="text-xs text-slate-600 space-y-1 mb-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Assignments:</span>
                  <span className="font-semibold text-slate-700">{item.totalAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Major Tasks (w ≥ 3):</span>
                  <span className={`font-semibold ${isCollision ? "text-rose-700" : "text-slate-700"}`}>
                    {item.majorAssignmentsCount}
                  </span>
                </div>
              </div>

              {/* Course Badges pill list */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.courses.map((courseCode) => (
                  <span
                    key={courseCode}
                    className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    {courseCode}
                  </span>
                ))}
                {item.courses.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic">No assignments due</span>
                )}
              </div>

              {/* Action link */}
              <Link
                href={`/weeks/${item.weekNumber}`}
                className={`mt-1 w-full text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  isCollision
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {isCollision ? "Inspect & Balance Moves" : "View Week Details"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
