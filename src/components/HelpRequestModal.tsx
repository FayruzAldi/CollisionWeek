"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import {
  X,
  HelpCircle,
  Tag,
  Send,
  Users,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface AssignmentOption {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  subtopics: string[];
  weekNumber: number;
}

interface HelpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignments: AssignmentOption[];
  preselectedAssignmentId?: string;
  preselectedSubtopic?: string;
}

export function HelpRequestModal({
  isOpen,
  onClose,
  onSuccess,
  assignments,
  preselectedAssignmentId,
  preselectedSubtopic,
}: HelpRequestModalProps) {
  const { currentUser } = useRole();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    preselectedAssignmentId || assignments[0]?.id || ""
  );
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(
    preselectedSubtopic || ""
  );
  const [customSubtopic, setCustomSubtopic] = useState<string>("");
  const [questionDetail, setQuestionDetail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const subtopic = customSubtopic.trim() || selectedSubtopic;
    if (!selectedAssignmentId) {
      setError("Please select an assignment.");
      return;
    }
    if (!subtopic) {
      setError("Please select or specify a sub-topic tag.");
      return;
    }
    if (!questionDetail.trim() || questionDetail.trim().length < 15) {
      setError("Please describe your academic blocker in at least 15 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          requesterId: currentUser?.id,
          subtopicLabel: subtopic,
          questionDetail: questionDetail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to create help request.");
      }
    } catch {
      setError("Network error creating help request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEF0FD] text-[#5850EC] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Request Sub-topic Peer Help
              </h3>
              <p className="text-xs text-slate-500">
                Post your specific blocker for class-wide peer unblocking
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

        {/* Cold-Start Whole-Class Visibility Notice */}
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center gap-2 text-xs text-indigo-950 font-medium">
          <Users className="w-4 h-4 text-[#5850EC] flex-shrink-0" />
          <span>
            <strong>Whole-Class Visibility:</strong> Automatically published to all enrolled peers in this course.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Assignment Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Assignment:
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                setSelectedSubtopic("");
              }}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#5850EC]/30 focus:outline-hidden"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.courseCode}] Week {a.weekNumber} — {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subtopic Tags */}
          {activeAssignment && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#5850EC]" />
                  Select Sub-topic Tag:
                </span>
                <span className="text-[11px] text-slate-400">Click a tag below</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {activeAssignment.subtopics?.map((tag: string) => {
                  const isSelected = selectedSubtopic === tag && !customSubtopic;
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        setSelectedSubtopic(tag);
                        setCustomSubtopic("");
                      }}
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all ${
                        isSelected
                          ? "bg-[#5850EC] text-white border-[#5850EC] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Or type custom sub-topic tag..."
                value={customSubtopic}
                onChange={(e) => setCustomSubtopic(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5850EC]/30 focus:outline-hidden"
              />
            </div>
          )}

          {/* Question Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe your question or blocker:
            </label>
            <textarea
              rows={4}
              placeholder="e.g. In the query optimization part, how do we prove dependency preservation for BCNF decomposition without breaking 3NF? Here is what I tried..."
              value={questionDetail}
              onChange={(e) => setQuestionDetail(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5850EC]/30 focus:outline-hidden leading-relaxed"
            ></textarea>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#5850EC] hover:bg-[#4B41DE] rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Publishing..." : "Post Help Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
