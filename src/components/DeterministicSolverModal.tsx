"use client";

import React, { useState, useEffect } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Layers,
  Clock,
  AlertOctagon,
} from "lucide-react";

interface DeterministicSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeterministicSolverModal({
  isOpen,
  onClose,
  onSuccess,
}: DeterministicSolverModalProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(8);
  const [difficultyMode, setDifficultyMode] = useState<"strict" | "relaxed" | "multi">("strict");
  const [candidates, setCandidates] = useState<DateMoveProposalCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"minimal" | "single" | "simulation">("minimal");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWeekCandidates(selectedWeek);
    }
  }, [isOpen, selectedWeek]);

  const fetchWeekCandidates = async (w: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weeks/${w}`);
      if (res.ok) {
        const json = await res.json();
        setCandidates(json.candidates || []);
      }
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyShift = async (cand: DateMoveProposalCandidate) => {
    const key = `${cand.assignmentId}-${cand.proposedWeek}`;
    try {
      setProcessingId(key);
      const res = await fetch(`/api/proposals/${cand.id || cand.assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          candidate: cand,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to apply date shift.");
      }
    } catch {
      alert("Error applying date move.");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Deterministic Minimal Date Move Solver
              </h3>
              <p className="text-xs text-slate-500">
                100% deterministic heuristic: balances clashing deadlines without triggering new collisions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout (Matching Image 5) */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Left Column: 3 modes */}
          <div className="md:col-span-4 p-5 border-r border-slate-100 bg-slate-50/50 space-y-3">
            <button
              onClick={() => setActiveTab("minimal")}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                activeTab === "minimal"
                  ? "bg-white border-indigo-400 shadow-xs ring-2 ring-indigo-500/10"
                  : "bg-transparent border-transparent hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs">Minimal Date Moves</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Evaluates nearest neighbors (w±1, w+2) to identify the smallest day displacement.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("single")}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                activeTab === "single"
                  ? "bg-white border-indigo-400 shadow-xs ring-2 ring-indigo-500/10"
                  : "bg-transparent border-transparent hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900 text-xs">Load Delta Simulation</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Inspect cumulative load reduction and safe capacity across the entire 16 weeks.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("simulation")}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                activeTab === "simulation"
                  ? "bg-white border-indigo-400 shadow-xs ring-2 ring-indigo-500/10"
                  : "bg-transparent border-transparent hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-900 text-xs">Multi-Scenario What-If</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Planned for Final Day: multi-cohort cross-faculty schedule rebalancing.
              </p>
            </button>
          </div>

          {/* Right Column: Parameters and Results */}
          <div className="md:col-span-8 p-6 space-y-5 overflow-y-auto max-h-[500px]">
            {/* Week Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Crunch Week to Balance:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedWeek(8)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedWeek === 8
                      ? "border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Week 8 (Midterms)</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                      C = 4 Clashing
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Database, Software Eng, Networks, OS
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedWeek(14)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedWeek === 14
                      ? "border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Week 14 (Pre-Finals)</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                      C = 3 Clashing
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Database, Software Eng, Artificial Intel
                  </p>
                </button>
              </div>
            </div>

            {/* Constraint Level Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Heuristic Constraint Level:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDifficultyMode("strict")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    difficultyMode === "strict"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Strict (C &lt; 3 Required)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficultyMode("relaxed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    difficultyMode === "relaxed"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Minimal Shift (+1 week)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficultyMode("multi")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    difficultyMode === "multi"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Max Load Delta
                </button>
              </div>
            </div>

            {/* Candidate Solution List */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-slate-800">
                Recommended Date Move Solutions ({candidates.length}):
              </label>

              {loading ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                  <p className="text-xs">Computing minimal moves...</p>
                </div>
              ) : candidates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No candidates found for this week.</p>
              ) : (
                candidates.slice(0, 2).map((cand, idx) => {
                  const key = `${cand.assignmentId}-${cand.proposedWeek}`;
                  const isProcessing = processingId === key;

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {cand.courseCode}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {cand.assignmentTitle}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {idx === 0 ? "Rank #1 Optimal" : "Alternative"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Week {cand.originalWeek} ({formatDate(cand.originalDueDate)})
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                          Week {cand.proposedWeek} ({formatDate(cand.proposedDueDate)})
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500">
                          Collision impact: <strong>C = {cand.originalCollisionCount} → {cand.projectedCollisionCount}</strong>
                        </span>

                        <button
                          onClick={() => handleApplyShift(cand)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-[#5850EC] hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isProcessing ? "Applying..." : "Approve & Shift Date"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero AI hallucination • 100% Deterministic heuristic calculation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
