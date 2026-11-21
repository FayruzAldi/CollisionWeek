"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DateMoveSolver } from "@/components/DateMoveSolver";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  HelpCircle,
  Users,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface WeekDetailData {
  weekNumber: number;
  metric: {
    weekNumber: number;
    loadIndex: number;
    collisionCount: number;
    isFlagged: boolean;
  };
  assignments: any[];
  collidingCourses: { code: string; name: string; count: number }[];
  candidates: any[];
  savedProposals: any[];
}

export default function WeekInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const weekNumber = parseInt(params.weekNumber as string, 10) || 8;

  const [data, setData] = useState<WeekDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedAssignmentForHelp, setSelectedAssignmentForHelp] = useState<any | null>(null);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weeks/${weekNumber}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load week details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [weekNumber]);

  const isCollision = (data?.metric.collisionCount ?? 0) >= 3;
  const isCaution = (data?.metric.collisionCount ?? 0) === 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb & Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to 16-Week Heat Map</span>
        </Link>

        {/* 16-Week Carousel Quick Selector */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => router.push(`/weeks/${Math.max(1, weekNumber - 1)}`)}
            disabled={weekNumber <= 1}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === weekNumber;
            return (
              <button
                key={w}
                onClick={() => router.push(`/weeks/${w}`)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-xs"
                    : w === 8 || w === 14
                    ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {w}
              </button>
            );
          })}

          <button
            onClick={() => router.push(`/weeks/${Math.min(16, weekNumber + 1)}`)}
            disabled={weekNumber >= 16}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
          isCollision
            ? "border-rose-300 bg-gradient-to-r from-rose-50 via-white to-rose-50/50"
            : isCaution
            ? "border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50"
            : "border-slate-200 bg-gradient-to-r from-emerald-50/30 via-white to-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Academic Calendar
              </span>
              {weekNumber === 8 && (
                <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                  Midterm Examination &amp; Milestone Week
                </span>
              )}
              {weekNumber === 14 && (
                <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                  Pre-Final Project Crunch
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Week {weekNumber} Deep Dive</span>
              {isCollision && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold inline-flex items-center gap-1 shadow-xs">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Collision Week
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              {isCollision
                ? `High academic hazard: ${data?.collidingCourses.length} major courses have simultaneous deadlines. Student survey indicates peak sleep deprivation (≤5h/night) during this period.`
                : isCaution
                ? "Moderate load: 2 major courses have deadlines this week. Monitor closely to prevent compounding bottlenecks."
                : "Safe academic load: Assignments are well-distributed within healthy student capacity."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[90px]">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Collision Count
              </span>
              <span
                className={`text-2xl font-black ${
                  isCollision
                    ? "text-rose-600"
                    : isCaution
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                C = {data?.metric.collisionCount ?? 0}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {isCollision ? "≥ 3 Clashing" : "Healthy"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center min-w-[90px]">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Load Index
              </span>
              <span className="text-2xl font-black text-slate-800">
                L = {data?.metric.loadIndex ?? 0}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deterministic Minimal Date Move Solver Section (US-03, US-04) */}
      <section>
        <DateMoveSolver
          candidates={data?.candidates || []}
          weekNumber={weekNumber}
          currentCollisionCount={data?.metric.collisionCount ?? 0}
          onProposalAccepted={fetchWeekData}
        />
      </section>

      {/* Assignments in Week w */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              Assignments Due in Week {weekNumber} ({data?.assignments.length || 0})
            </h3>
            <p className="text-xs text-slate-500">
              Each major assignment (weight ≥ 3) triggers a collision flag across concurrent courses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (data?.assignments.length) {
                  setSelectedAssignmentForHelp(data.assignments[0]);
                  setHelpModalOpen(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask Sub-topic Peer Help</span>
            </button>
          </div>
        </div>

        {/* Assignments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.assignments.map((item) => {
            const isMajor = item.weightScore >= 3;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                  isMajor
                    ? "border-rose-200 hover:border-rose-300"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                      style={{ backgroundColor: item.courseColor || "#2563eb" }}
                    >
                      {item.courseCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.courseName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700">
                      Weight: {item.weightScore}/5
                    </span>
                    {isMajor ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        Major Task
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Minor
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {item.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: <strong>{formatDate(item.dueDate)}</strong>
                  </span>
                  <span>•</span>
                  <span>Lecturer: {item.lecturerName}</span>
                </div>

                {/* Structured Subtopics Tags (PRD Section 5.3) */}
                <div className="pt-2.5 border-t border-slate-100 mb-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Structured Sub-topic Tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.subtopics.map((sub: string) => (
                      <span
                        key={sub}
                        className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-200 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedAssignmentForHelp(item);
                          setHelpModalOpen(true);
                        }}
                      >
                        #{sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <Link
                    href={`/help?courseId=${item.courseId}`}
                    className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {item.helpRequestsCount} Peer Request{item.helpRequestsCount !== 1 ? "s" : ""}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedAssignmentForHelp(item);
                      setHelpModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                    <span>Get Help on Sub-topic</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Request Modal */}
      {selectedAssignmentForHelp && (
        <HelpRequestModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          onSuccess={() => {
            fetchWeekData();
            alert("Help request posted to class help board!");
          }}
          assignments={
            data?.assignments.map((a) => ({
              id: a.id,
              title: a.title,
              courseCode: a.courseCode,
              courseName: a.courseName,
              subtopics: a.subtopics,
              weekNumber: a.weekNumber,
            })) || []
          }
          preselectedAssignmentId={selectedAssignmentForHelp?.id}
        />
      )}
    </div>
  );
}
