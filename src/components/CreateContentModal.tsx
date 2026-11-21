"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  BookOpen,
  FileText,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  Users,
  RotateCcw,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelpModal: () => void;
  onOpenSolverModal: () => void;
}

export function CreateContentModal({
  isOpen,
  onClose,
  onOpenHelpModal,
  onOpenSolverModal,
}: CreateContentModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const contentOptions = [
    {
      id: "help-request",
      title: "Sub-topic Peer Help",
      badge: "Most Used",
      badgeColor: "bg-purple-100 text-purple-700",
      description: "Ask a specific question on an assignment sub-topic for whole-class peer unblocking.",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600",
      action: () => {
        onClose();
        onOpenHelpModal();
      },
    },
    {
      id: "date-solver",
      title: "Deterministic Date Move",
      badge: "Deterministic",
      badgeColor: "bg-indigo-100 text-indigo-700",
      description: "Execute mathematical heuristic solver to balance crunch weeks without creating new collisions.",
      icon: Sparkles,
      iconBg: "bg-purple-50 text-purple-600",
      action: () => {
        onClose();
        onOpenSolverModal();
      },
    },
    {
      id: "csv-import",
      title: "CSV Schedule Ingestion",
      badge: "Layer 1",
      badgeColor: "bg-sky-100 text-sky-700",
      description: "Upload academic assignment deadlines to map 16-week load and evaluate collisions.",
      icon: Layers,
      iconBg: "bg-amber-50 text-amber-600",
      action: () => {
        onClose();
        router.push("/import");
      },
    },
    {
      id: "session-20min",
      title: "20-Min Micro-Session",
      badge: "Peer Help",
      badgeColor: "bg-emerald-100 text-emerald-700",
      description: "Offer or request an interactive 20-minute video/meeting discussion on a difficult topic.",
      icon: Clock,
      iconBg: "bg-emerald-50 text-emerald-600",
      action: () => {
        onClose();
        router.push("/help?filter=needs_help");
      },
    },
    {
      id: "analytics",
      title: "Lecturer Bottlenecks",
      badge: "Pedagogy",
      badgeColor: "bg-rose-100 text-rose-700",
      description: "Analyze sub-topic friction density rankings and recommended syllabus interventions.",
      icon: BarChart3,
      iconBg: "bg-rose-50 text-rose-600",
      action: () => {
        onClose();
        router.push("/analytics");
      },
    },
    {
      id: "reset-demo",
      title: "Reset Synthetic Data",
      badge: "Demo Kit",
      badgeColor: "bg-slate-100 text-slate-700",
      description: "Restore the full 16-week, 6-course, 28-assignment synthetic demonstration dataset.",
      icon: RotateCcw,
      iconBg: "bg-slate-100 text-slate-600",
      action: async () => {
        onClose();
        if (confirm("Reset database to initial synthetic demo dataset?")) {
          await fetch("/api/seed", { method: "POST" });
          window.location.reload();
        }
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
            Create new content &amp; actions
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Tile Grid (Exact layout from Image 3) */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[75vh] overflow-y-auto">
          {contentOptions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/80 hover:border-indigo-300 transition-all flex flex-col justify-between group shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${item.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
