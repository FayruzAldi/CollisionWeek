"use client";

import React, { useState } from "react";
import { DateMoveProposalCandidate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertOctagon,
  Clock,
} from "lucide-react";

interface DateMoveSolverProps {
  candidates: DateMoveProposalCandidate[];
  weekNumber: number;
  currentCollisionCount: number;
  onProposalAccepted?: () => void;
}

export function DateMoveSolver({
  candidates,
  weekNumber,
  currentCollisionCount,
  onProposalAccepted,
}: DateMoveSolverProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAction = async (
    candidate: DateMoveProposalCandidate,
    action: "ACCEPT" | "REJECT"
  ) => {
    const candidateKey = `${candidate.assignmentId}-${candidate.proposedWeek}`;
    setProcessingId(candidateKey);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/proposals/${candidate.id || candidate.assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          candidate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === "ACCEPT") {
          setSuccessMessage(
            `Accepted! "${candidate.assignmentTitle}" moved to Week ${candidate.proposedWeek} (${formatDate(candidate.proposedDueDate)}). Load recalculated.`
          );
          if (onProposalAccepted) {
            onProposalAccepted();
          }
        } else {
          setSuccessMessage("Proposal was declined.");
        }
      } else {
        setErrorMessage(data.error || "Failed to process date move proposal.");
      }
    } catch {
      setErrorMessage("Network error processing date move.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="trenning-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#EEF0FD] text-[#5850EC]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Deterministic Minimal Date Move Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Mathematical heuristic solver: evaluates nearest neighbor weeks (w-1, w+1, w+2)
            to identify the smallest date shift that drops collisions below 3 without causing new collisions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500">Current Week {weekNumber}:</span>
          <span className="font-extrabold text-rose-600">
            C<sub>{weekNumber}</sub> = {currentCollisionCount} Collisions
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Candidate proposals */}
      <div className="space-y-3.5">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-medium">No date shift required or no safe candidate found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Week {weekNumber} has C<sub>w</sub> &lt; 3 or neighboring weeks are already at peak capacity.
            </p>
          </div>
        ) : (
          candidates.map((cand, idx) => {
            const candidateKey = `${cand.assignmentId}-${cand.proposedWeek}`;
            const isProcessing = processingId === candidateKey;
            const resolvesCollision = cand.projectedCollisionCount < 3;

            return (
              <div
                key={candidateKey}
                className={`p-4.5 rounded-2xl border transition-all ${
                  resolvesCollision
                    ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Proposal summary */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {cand.courseCode}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {cand.assignmentTitle}
                      </h4>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5850EC] text-white flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3 h-3" />
                          Rank #1 Optimal Shift
                        </span>
                      )}
                    </div>

                    {/* Move trajectory */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Week {cand.originalWeek} ({formatDate(cand.originalDueDate)})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Week {cand.proposedWeek} ({formatDate(cand.proposedDueDate)})</span>
                      </div>
                    </div>

                    {/* Collision Impact delta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="text-slate-400">Week {cand.originalWeek}:</span>
                        <span className="line-through text-rose-500 font-semibold">
                          C = {cand.originalCollisionCount}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-700 font-bold">
                          C = {cand.projectedCollisionCount}
                        </span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="text-slate-400">Target Week {cand.proposedWeek}:</span>
                        <span className="text-slate-600 font-semibold">
                          C = {cand.originalTargetCollisionCount}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-700 font-bold">
                          C = {cand.projectedTargetCollisionCount} (&lt; 3 Safe)
                        </span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Load: -{cand.loadReductionDelta} pts</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      {cand.reason}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col lg:flex-row items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleAction(cand, "ACCEPT")}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isProcessing ? "Processing..." : "Approve & Shift Date"}
                    </button>
                    <button
                      onClick={() => handleAction(cand, "REJECT")}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
