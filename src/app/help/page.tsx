"use client";

import React, { useEffect, useState } from "react";
import { HelpRequestData } from "@/lib/types";
import { HelpResponseDrawer } from "@/components/HelpResponseDrawer";
import { HelpRequestModal } from "@/components/HelpRequestModal";
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
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "needs_help" | "in_progress" | "resolved"
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
      const [cRes, hRes] = await fetch("/api/courses").then((r) => r.json());
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }

      // Fetch assignments for modal select
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-sky-300" />
            Layer 2: Sub-topic Peer Assistance Network
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Sub-topic Peer Help Board
          </h1>

          <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
            Eliminates learning bottlenecks when assignments collide. <strong>62%</strong> of students
            cannot identify who has understood specific sub-topics in their class. Post your blocker
            or help a classmate through <strong>written text</strong>, a <strong>short recording</strong>, or a <strong>20-minute micro-session</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ask for Sub-topic Peer Help</span>
            </button>

            <button
              onClick={() => setActiveFilter("needs_help")}
              className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>View Urgent Needs ({stats.needsHelpUrgent})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveFilter("all")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "all"
              ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Total Inquiries
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-500">Across all courses</span>
        </div>

        <div
          onClick={() => setActiveFilter("needs_help")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "needs_help"
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-rose-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-500 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            Needs Peer Help (&gt;12h)
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.needsHelpUrgent}</p>
          <span className="text-[11px] text-rose-600 font-medium">Prioritized at top</span>
        </div>

        <div
          onClick={() => setActiveFilter("in_progress")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "in_progress"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-600 uppercase">
            In Discussion
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.inProgress}</p>
          <span className="text-[11px] text-slate-500">Responses received</span>
        </div>

        <div
          onClick={() => setActiveFilter("resolved")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "resolved"
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">
            Resolved Loops
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Unblocked students</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sub-topics (#3NF, B-Tree, TCP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition-all"
          />
        </form>

        {/* Course Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Course:
          </span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
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

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-semibold">Loading Class Help Requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No help requests matching filter.</p>
            <p className="text-xs text-slate-400 mt-1">
              Be the first to ask a sub-topic question or change your filter selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((r) => {
              const isResolved = r.status === "RESOLVED";

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRequest(r);
                    setIsDrawerOpen(true);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs hover:shadow-md ${
                    r.isUrgent
                      ? "border-rose-300 bg-gradient-to-r from-rose-50/40 via-white to-white ring-1 ring-rose-400"
                      : isResolved
                      ? "border-slate-200 opacity-90 hover:opacity-100"
                      : "border-slate-200 hover:border-sky-300"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: r.assignment.course.color || "#2563eb",
                        }}
                      >
                        {r.assignment.course.courseCode}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        #{r.subtopicLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                          Needs Peer Help (&gt;12h)
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
                  </div>

                  {/* Assignment Title */}
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Task: {r.assignment.title} (Week {r.assignment.weekNumber})
                  </p>

                  {/* Question Detail */}
                  <p className="text-xs text-slate-800 font-medium line-clamp-3 mb-3 leading-relaxed">
                    {r.questionDetail}
                  </p>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                        {r.requester.name.charAt(0)}
                      </div>
                      <span className="truncate max-w-[120px] font-medium text-slate-700">
                        {r.requester.name}
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(r.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-sky-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{r.responsesCount || r.responses?.length || 0} response(s)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            // refresh selected request details
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
