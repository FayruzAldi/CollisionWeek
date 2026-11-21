"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PastelIllustration } from "@/components/PastelIllustrations";
import { CircularProgressRing } from "@/components/CircularProgressRing";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
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
  onOpenSolverModal?: () => void;
}

export function HeatMapGrid({ metrics, onOpenSolverModal }: HeatMapGridProps) {
  const [filter, setFilter] = useState<"ALL" | "FLAGGED" | "CAUTION" | "SAFE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredMetrics = metrics.filter((m) => {
    if (filter === "FLAGGED") return m.collisionCount >= 3;
    if (filter === "CAUTION") return m.collisionCount === 2;
    if (filter === "SAFE") return m.collisionCount <= 1;
    return true;
  }).filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `week ${m.weekNumber}`.includes(q) ||
      m.courses.some((c) => c.toLowerCase().includes(q))
    );
  });

  const maxLoad = Math.max(...metrics.map((m) => m.loadIndex), 1);

  const getIllustrationType = (weekNumber: number) => {
    if (weekNumber === 8) return "laptop";
    if (weekNumber === 14) return "notebook";
    if (weekNumber === 6 || weekNumber === 10) return "analytics";
    if (weekNumber === 16) return "document";
    const types: ("laptop" | "document" | "notebook" | "analytics" | "palette" | "collaboration")[] = [
      "laptop",
      "notebook",
      "analytics",
      "palette",
      "document",
      "collaboration",
    ];
    return types[weekNumber % types.length];
  };

  return (
    <div className="space-y-6">
      {/* Filter and Control Bar (Matching Image 1 & 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Status ({metrics.length})
          </button>
          <button
            onClick={() => setFilter("FLAGGED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "FLAGGED"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-rose-50 border border-slate-200"
            }`}
          >
            Collision Weeks (≥3)
          </button>
          <button
            onClick={() => setFilter("CAUTION")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "CAUTION"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200"
            }`}
          >
            Caution (2)
          </button>
          <button
            onClick={() => setFilter("SAFE")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "SAFE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
            }`}
          >
            Safe (≤1)
          </button>
        </div>

        {/* Right Search & View Toggles */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search weeks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs rounded-xl bg-white border border-[#E9ECF2] pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#5850EC]/30"
            />
          </div>

          <div className="flex items-center bg-white border border-[#E9ECF2] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-[#EEF0FD] text-[#5850EC]" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-[#EEF0FD] text-[#5850EC]" : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 16 Cards (Styled identical to Image 1 & Image 2) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMetrics.map((item) => {
            const isCollision = item.collisionCount >= 3;
            const isCaution = item.collisionCount === 2;
            const loadPercent = Math.min(100, Math.round((item.loadIndex / maxLoad) * 100));

            return (
              <div
                key={item.weekNumber}
                className="trenning-card group overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Thumbnail Banner with Illustration (Image 1 style) */}
                  <div className="h-32 w-full relative overflow-hidden border-b border-slate-100">
                    <PastelIllustration type={getIllustrationType(item.weekNumber)} />

                    {/* Top-left pill badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <span>Week {item.weekNumber}</span>
                      <span>•</span>
                      <span>{item.totalAssignments} Tasks</span>
                    </div>

                    {/* Top-right collision alert badge if flagged */}
                    {isCollision && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                        <AlertOctagon className="w-3 h-3" />
                        <span>C={item.collisionCount}</span>
                      </div>
                    )}
                    {isCaution && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                        C=2
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Category / Type row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.weekNumber === 8
                          ? "Midterm Week"
                          : item.weekNumber === 16
                          ? "Final Exam Week"
                          : `Academic Week ${item.weekNumber}`}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCollision
                            ? "bg-rose-100 text-rose-700"
                            : isCaution
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isCollision ? "Collision Crunch" : isCaution ? "Moderate" : "Safe Load"}
                      </span>
                    </div>

                    {/* Week Title */}
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#5850EC] transition-colors">
                      {item.weekNumber === 8
                        ? "Midterm Project & Assessment Crunch"
                        : item.weekNumber === 14
                        ? "Pre-Final Project Milestones"
                        : `Semester Week ${item.weekNumber} Academic Schedule`}
                    </h4>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.courses.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F5F8] text-slate-600"
                        >
                          {c}
                        </span>
                      ))}
                      {item.courses.length > 3 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          +{item.courses.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Circular / Ring Progress Gauge (Image 2 style) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <CircularProgressRing
                        value={loadPercent}
                        size={34}
                        strokeWidth={3.5}
                        color={isCollision ? "#EF4444" : isCaution ? "#F59E0B" : "#10B981"}
                        label={`${item.loadIndex} pts`}
                        sublabel="Load Index"
                      />

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Major Tasks</span>
                        <span className={`text-xs font-black ${isCollision ? "text-rose-600" : "text-slate-700"}`}>
                          {item.majorAssignmentsCount} Course{item.majorAssignmentsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="p-3 px-4 bg-[#FAFBFD] border-t border-[#F1F3F8] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isCollision ? "High clustering" : "Balanced load"}
                  </span>

                  <Link
                    href={`/weeks/${item.weekNumber}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isCollision
                        ? "bg-[#5850EC] text-white hover:bg-[#4B41DE] shadow-xs"
                        : "bg-white border border-[#E9ECF2] text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{isCollision ? "Solve Moves" : "View"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredMetrics.map((item) => (
            <div
              key={item.weekNumber}
              className="p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-800 text-xs">
                  W{item.weekNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Week {item.weekNumber} Academic Schedule
                    </h4>
                    {item.collisionCount >= 3 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Collision Week
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Courses: {item.courses.join(", ") || "None"} • {item.totalAssignments} assignments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Load Index</span>
                  <span className="font-bold text-slate-800 text-sm">{item.loadIndex} pts</span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Collisions</span>
                  <span
                    className={`font-black text-sm ${
                      item.collisionCount >= 3
                        ? "text-rose-600"
                        : item.collisionCount === 2
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    C = {item.collisionCount}
                  </span>
                </div>

                <Link
                  href={`/weeks/${item.weekNumber}`}
                  className="px-4 py-2 rounded-xl bg-[#5850EC] text-white text-xs font-bold hover:bg-[#4B41DE] transition-colors"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
