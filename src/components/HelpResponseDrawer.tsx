"use client";

import React, { useState } from "react";
import { HelpRequestData, ResponseType } from "@/lib/types";
import { useRole } from "@/context/RoleContext";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  X,
  CheckCircle,
  FileText,
  Video,
  Clock,
  Send,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface HelpResponseDrawerProps {
  request: HelpRequestData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function HelpResponseDrawer({
  request,
  isOpen,
  onClose,
  onUpdated,
}: HelpResponseDrawerProps) {
  const { currentUser } = useRole();

  const [activeTab, setActiveTab] = useState<ResponseType>("WRITTEN");
  const [writtenContent, setWrittenContent] = useState("");
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedNotes, setRecordedNotes] = useState("");
  const [sessionDateTime, setSessionDateTime] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      const res = await fetch(`/api/help-requests/${request.id}/resolve`, {
        method: "PATCH",
      });
      if (res.ok) {
        onUpdated();
      } else {
        alert("Failed to mark as resolved.");
      }
    } catch {
      alert("Network error marking request resolved.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let contentOrUrl = "";
    let scheduledSlot: string | null = null;

    if (activeTab === "WRITTEN") {
      if (!writtenContent.trim()) {
        setError("Please enter your written explanation.");
        return;
      }
      contentOrUrl = writtenContent.trim();
    } else if (activeTab === "RECORDED_LINK") {
      if (!recordedUrl.trim()) {
        setError("Please provide the recording URL (Loom, YouTube, Drive, etc.).");
        return;
      }
      contentOrUrl = recordedNotes.trim()
        ? `${recordedUrl.trim()}\nNotes: ${recordedNotes.trim()}`
        : recordedUrl.trim();
    } else if (activeTab === "SESSION_20MIN") {
      if (!sessionDateTime) {
        setError("Please choose a suggested time slot for the 20-min session.");
        return;
      }
      scheduledSlot = new Date(sessionDateTime).toISOString();
      contentOrUrl = sessionNotes.trim()
        ? `Proposed 20-Minute Micro-Session at ${sessionDateTime}. Agenda: ${sessionNotes.trim()}`
        : `Proposed 20-Minute Micro-Session at ${sessionDateTime}.`;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/help-requests/${request.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helperId: currentUser?.id,
          responseType: activeTab,
          contentOrUrl,
          scheduledSlot,
        }),
      });

      if (res.ok) {
        setWrittenContent("");
        setRecordedUrl("");
        setRecordedNotes("");
        setSessionDateTime("");
        setSessionNotes("");
        onUpdated();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to submit response.");
      }
    } catch {
      setError("Network error sending response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResolved = request.status === "RESOLVED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {request.assignment.course.courseCode}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                #{request.subtopicLabel}
              </span>
              {request.isUrgent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  Needs Peer Help (&gt;12h)
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isResolved
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {request.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {request.assignment.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Asked by <strong className="text-slate-700">{request.requester.name}</strong> • {formatDateTime(request.createdAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Question Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Blocker Description
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {request.questionDetail}
            </p>
          </div>

          {/* Resolution Banner & Button (US-07) */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-900">
                {isResolved ? "Problem Successfully Resolved 🎉" : "Ready to close this question?"}
              </p>
              <p className="text-[11px] text-emerald-700">
                {isResolved
                  ? `Marked resolved on ${formatDateTime(request.resolvedAt)}`
                  : "Both requester and helper can mark this request resolved to update class resolution KPIs."}
              </p>
            </div>
            {!isResolved && (
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto"
              >
                <CheckCircle className="w-4 h-4" />
                {isResolving ? "Resolving..." : "Mark as Resolved"}
              </button>
            )}
          </div>

          {/* Response List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                Peer Responses ({request.responses.length})
              </h4>
            </div>

            {request.responses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium">No peer responses yet.</p>
                <p className="text-[11px] text-slate-400">
                  Be the first classmate to unblock {request.requester.name}!
                </p>
              </div>
            ) : (
              request.responses.map((resp) => {
                const isWritten = resp.responseType === "WRITTEN";
                const isRecorded = resp.responseType === "RECORDED_LINK";
                const isSession = resp.responseType === "SESSION_20MIN";

                return (
                  <div
                    key={resp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px]">
                          {resp.helper.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {resp.helper.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({resp.helper.role})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-500">
                          {isWritten && "📝 Written Explanation"}
                          {isRecorded && "🎥 Video/Audio Link"}
                          {isSession && "⏱️ 20-Min Session"}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(resp.createdAt)}</span>
                      </div>
                    </div>

                    {/* Content Display */}
                    {isWritten && (
                      <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap font-sans">
                        {resp.contentOrUrl}
                      </div>
                    )}

                    {isRecorded && (
                      <div className="text-xs bg-sky-50 border border-sky-200 p-3 rounded-lg">
                        <p className="font-semibold text-sky-900 mb-1 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-sky-600" />
                          Screen Recording / Voice Memo Link:
                        </p>
                        <a
                          href={resp.contentOrUrl.split("\n")[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 hover:text-sky-900 underline flex items-center gap-1 font-medium break-all"
                        >
                          {resp.contentOrUrl.split("\n")[0]}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        {resp.contentOrUrl.includes("Notes:") && (
                          <p className="mt-2 text-slate-600 text-[11px]">
                            {resp.contentOrUrl.substring(resp.contentOrUrl.indexOf("Notes:"))}
                          </p>
                        )}
                      </div>
                    )}

                    {isSession && (
                      <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>20-Minute Micro-Session Proposed</span>
                        </div>
                        {resp.scheduledSlot && (
                          <p className="text-xs text-amber-800 font-medium mb-1">
                            Slot: {formatDateTime(resp.scheduledSlot)}
                          </p>
                        )}
                        <p className="text-slate-700 text-[11px]">
                          {resp.contentOrUrl}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Form to Submit Response (3 Channels) */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Provide Peer Assistance (3 Inclusive Channels)
            </h4>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("WRITTEN")}
                className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "WRITTEN"
                    ? "border-sky-600 text-sky-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                1. Written Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("RECORDED_LINK")}
                className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "RECORDED_LINK"
                    ? "border-sky-600 text-sky-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                2. Short Recorded Link
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SESSION_20MIN")}
                className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "SESSION_20MIN"
                    ? "border-sky-600 text-sky-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                3. 20-Min Session
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSendResponse} className="space-y-3">
              {activeTab === "WRITTEN" && (
                <div>
                  <textarea
                    rows={4}
                    placeholder="Provide your solution explanation or step-by-step code guidance here..."
                    value={writtenContent}
                    onChange={(e) => setWrittenContent(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                  ></textarea>
                </div>
              )}

              {activeTab === "RECORDED_LINK" && (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Paste Loom / Google Drive / YouTube recording URL..."
                    value={recordedUrl}
                    onChange={(e) => setRecordedUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Short description / timestamp notes (optional)..."
                    value={recordedNotes}
                    onChange={(e) => setRecordedNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}

              {activeTab === "SESSION_20MIN" && (
                <div className="space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                    <span>Propose a 20-Minute Focus Slot:</span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                      Planned for Final Day: Auto-Matcher
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    value={sessionDateTime}
                    onChange={(e) => setSessionDateTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Meeting link (Google Meet / Zoom) or notes..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Responding as <strong>{currentUser?.name}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Sending..." : "Submit Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
