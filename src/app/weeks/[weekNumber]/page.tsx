"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DateMoveSolver } from "@/components/DateMoveSolver";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import { PastelIllustration } from "@/components/PastelIllustrations";
import { CircularProgressRing } from "@/components/CircularProgressRing";
import { formatDate } from "@/lib/utils";
import { useModals } from "@/context/ModalContext";
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
  Clock,
  BookOpen,
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
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedAssignmentForHelp, setSelectedAssignmentForHelp] = useState<any | null>(null);
  const { openSolverModal } = useModals();

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
  const activeAssignment = data?.assignments[selectedAssignmentIndex] || data?.assignments[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Header & Week Carousel (Matching Image 4 header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Week {weekNumber} Academic Schedule
              </h1>
              {isCollision && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  Collision Crunch (Cw = {data?.metric.collisionCount})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {data?.assignments.length || 0} Assignments • Load Index: {data?.metric.loadIndex || 0} pts
            </p>
          </div>
        </div>

        {/* 16-Week Quick Carousel */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <button
            onClick={() => router.push(`/weeks/${Math.max(1, weekNumber - 1)}`)}
            disabled={weekNumber <= 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === weekNumber;
            return (
              <button
                key={w}
                onClick={() => router.push(`/weeks/${w}`)}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-[#5850EC] text-white shadow-xs"
                    : w === 8 || w === 14
                    ? "bg-rose-100 text-rose-800 font-extrabold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {w}
              </button>
            );
          })}

          <button
            onClick={() => router.push(`/weeks/${Math.min(16, weekNumber + 1)}`)}
            disabled={weekNumber >= 16}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two-Panel Layout (Matching Image 4: Left item list + Right detail form/viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sub-panel: Assignment List (Image 4 Question List style) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assignments Due ({data?.assignments.length || 0})
            </span>
            <button
              onClick={() => {
                setSelectedAssignmentForHelp(activeAssignment);
                setHelpModalOpen(true);
              }}
              className="text-xs font-bold text-[#5850EC] hover:underline flex items-center gap-1"
            >
              <span>+ Ask Help</span>
            </button>
          </div>

          <div className="space-y-2">
            {data?.assignments.map((item, idx) => {
              const isSelected = selectedAssignmentIndex === idx;
              const isMajor = item.weightScore >= 3;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAssignmentIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#5850EC] ring-2 ring-[#5850EC]/15 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: item.courseColor || "#2563EB" }}
                    >
                      {item.courseCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isMajor ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Weight: {item.weightScore}/5
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {idx + 1}. {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Due: {formatDate(item.dueDate)} • {item.subtopics?.length || 0} sub-topics
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Solve Card at bottom of left panel */}
          {isCollision && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-200 space-y-2 mt-4">
              <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                <AlertOctagon className="w-4 h-4" />
                <span>Collision Crunch Active</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Week {weekNumber} has {data?.collidingCourses.length} concurrent major deadlines. Apply a minimal date shift below to restore equilibrium.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel: Selected Assignment Detail & Minimal Date Move Solver */}
        <div className="lg:col-span-8 space-y-6">
          {activeAssignment && (
            <div className="trenning-card p-6 space-y-5">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-xs font-extrabold px-2.5 py-1 rounded-lg text-white shadow-2xs"
                    style={{ backgroundColor: activeAssignment.courseColor || "#2563EB" }}
                  >
                    {activeAssignment.courseCode}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {activeAssignment.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeAssignment.courseName} • Lecturer: {activeAssignment.lecturerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAssignmentForHelp(activeAssignment);
                      setHelpModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EEF0FD] text-[#5850EC] hover:bg-[#E0E3FC] text-xs font-bold transition-colors"
                  >
                    Ask Sub-topic Help
                  </button>
                </div>
              </div>

              {/* Assignment Meta Details (Image 4 form style) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Due Date</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {formatDate(activeAssignment.dueDate)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Weight Score</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {activeAssignment.weightScore} / 5 ({activeAssignment.isMajor ? "Major Task" : "Minor Task"})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Peer Help Density</span>
                  <span className="font-bold text-indigo-600 text-sm mt-0.5 block">
                    {activeAssignment.helpRequestsCount} Questions Asked
                  </span>
                </div>
              </div>

              {/* Sub-topics Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Structured Sub-topic Tags:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeAssignment.subtopics?.map((sub: string) => (
                    <span
                      key={sub}
                      onClick={() => {
                        setSelectedAssignmentForHelp(activeAssignment);
                        setHelpModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F4F5F8] text-slate-700 hover:bg-[#EEF0FD] hover:text-[#5850EC] border border-[#E9ECF2] transition-colors cursor-pointer"
                    >
                      #{sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Minimal Date Move Solver Section (US-03, US-04) */}
          <DateMoveSolver
            candidates={data?.candidates || []}
            weekNumber={weekNumber}
            currentCollisionCount={data?.metric.collisionCount ?? 0}
            onProposalAccepted={fetchWeekData}
          />
        </div>
      </div>

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
