"use client";

import React, { useEffect, useState } from "react";
import { HelpRequestData } from "@/lib/types";
import { HelpResponseDrawer } from "@/components/HelpResponseDrawer";
import { HelpRequestModal } from "@/components/HelpRequestModal";
import { PastelIllustration } from "@/components/PastelIllustrations";
import { CircularProgressRing } from "@/components/CircularProgressRing";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  HelpCircle,
  Search,
  Filter,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  List,
} from "lucide-react";

export default function PeerHelpBoardPage() {
  const [requests, setRequests] = useState<HelpRequestData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    needsHelpUrgent: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState<any[]>([]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCourse !== "all") params.set("courseId", selectedCourse);
      if (activeFilter !== "all") params.set("filter", activeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/help-requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load help requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndAssignments = async () => {
    try {
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }

      const week8Res = await fetch("/api/weeks/8");
      if (week8Res.ok) {
        const wData = await week8Res.json();
        setAssignmentOptions(wData.assignments || []);
      }
    } catch (err) {
      console.error("Error fetching auxiliary data:", err);
    }
  };

  useEffect(() => {
    fetchCoursesAndAssignments();
  }, []);

  useEffect(() => {
    fetchHelpRequests();
  }, [selectedCourse, activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHelpRequests();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Banner & Action Bar (Matching Image 2 Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Sub-topic Peer Help Board
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF0FD] text-[#5850EC]">
              {stats.total} Questions Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Class-wide peer unblocking across specific assignment sub-topics (Written, Short Video, or 20-min micro-session)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ask for Peer Help</span>
          </button>
        </div>
      </div>

      {/* Filter Pills & KPI stats (Image 1 & 2 style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Questions ({stats.total})
          </button>
          <button
            onClick={() => setActiveFilter("needs_help")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "needs_help"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-rose-600 hover:bg-rose-50 border border-rose-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Needs Peer Help (&gt;12h) ({stats.needsHelpUrgent})
          </button>
          <button
            onClick={() => setActiveFilter("in_progress")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === "in_progress"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200"
            }`}
          >
            In Discussion ({stats.inProgress})
          </button>
          <button
            onClick={() => setActiveFilter("resolved")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
            }`}
          >
            Resolved ({stats.resolved})
          </button>
        </div>

        {/* Right Search & Course Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search #subtopic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs rounded-xl bg-white border border-[#E9ECF2] pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#5850EC]/30"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs rounded-xl bg-white border border-[#E9ECF2] px-3 py-1.5 text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid (Image 2 style) */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-[#5850EC] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold">Loading Peer Help Board...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No help requests found matching filter.</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to ask a question on your assignments!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {requests.map((r, i) => {
            const isResolved = r.status === "RESOLVED";

            return (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRequest(r);
                  setIsDrawerOpen(true);
                }}
                className="trenning-card group overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Card Thumbnail Header (Image 2 style) */}
                  <div className="h-28 w-full relative overflow-hidden border-b border-slate-100">
                    <PastelIllustration type={i % 2 === 0 ? "laptop" : "notebook"} />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                      {r.assignment.course.courseCode}
                    </div>

                    {r.isUrgent && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Needs Help (&gt;12h)
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase">
                        #{r.subtopicLabel}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#5850EC] transition-colors">
                      {r.assignment.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {r.questionDetail}
                    </p>

                    {/* Circular Rings (Image 2 accuracy & completion rate style) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-[#5850EC] flex items-center justify-center font-bold text-[10px]">
                          {r.requester.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">
                          {r.requester.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#5850EC]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{r.responsesCount || r.responses?.length || 0} response(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 px-4 bg-[#FAFBFD] border-t border-[#F1F3F8] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(r.createdAt)}
                  </span>
                  <button className="font-bold text-[#5850EC] hover:text-[#4B41DE] flex items-center gap-1">
                    <span>Open Thread</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Response Drawer */}
      <HelpResponseDrawer
        request={selectedRequest}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedRequest(null);
        }}
        onUpdated={() => {
          fetchHelpRequests();
          if (selectedRequest) {
            fetch(`/api/assignments/${selectedRequest.assignmentId}/help`)
              .then((r) => r.json())
              .then((d) => {
                const refreshed = d.helpRequests?.find(
                  (hr: any) => hr.id === selectedRequest.id
                );
                if (refreshed) {
                  setSelectedRequest({
                    ...refreshed,
                    assignment: {
                      ...d.assignment,
                      course: d.assignment.course,
                    },
                  });
                }
              });
          }
        }}
      />

      {/* New Help Request Modal */}
      <HelpRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchHelpRequests();
        }}
        assignments={assignmentOptions}
      />
    </div>
  );
}
