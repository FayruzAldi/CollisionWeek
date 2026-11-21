"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Send } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";

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

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const subtopic = customSubtopic.trim() || selectedSubtopic;
    if (!selectedAssignmentId) {
      setError("Pilih tugas terlebih dahulu.");
      return;
    }
    if (!subtopic) {
      setError("Pilih atau tulis sub-topik.");
      return;
    }
    if (!questionDetail.trim() || questionDetail.trim().length < 15) {
      setError("Jelaskan kendala minimal 15 karakter.");
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
        setError(data.error || "Gagal mengajukan bantuan.");
      }
    } catch {
      setError("Koneksi gagal saat mengajukan bantuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Minta bantuan sub-topik"
      description="Tuliskan kendala spesifikmu agar dibaca seluruh kelas. Teman sekelas dapat membantu melalui tulisan, rekaman, atau sesi 20 menit."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-xl bg-semantic-danger-soft border border-semantic-danger-soft text-semantic-danger-fg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Pilih Tugas */}
        <Field id="assignment-select" label="Pilih tugas" required>
          <select
            id="assignment-select"
            value={selectedAssignmentId}
            onChange={(e) => {
              setSelectedAssignmentId(e.target.value);
              setSelectedSubtopic("");
            }}
            className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line px-3 py-2 text-cw-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                [{a.courseCode}] {a.title} (Pekan {a.weekNumber})
              </option>
            ))}
          </select>
        </Field>

        {/* Pilih Sub-topik */}
        {activeAssignment && (
          <Field id="subtopic-custom" label="Pilih sub-topik" required helperText="Pilih salah satu tag di atas atau tuliskan sub-topik baru.">
            <div className="space-y-2">
              {activeAssignment.subtopics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeAssignment.subtopics.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedSubtopic(tag);
                        setCustomSubtopic("");
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedSubtopic === tag && !customSubtopic
                          ? "bg-cw-accent text-white"
                          : "bg-cw-sunken text-cw-ink hover:bg-cw-accent-soft"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              <input
                id="subtopic-custom"
                type="text"
                value={customSubtopic}
                onChange={(e) => {
                  setCustomSubtopic(e.target.value);
                  if (e.target.value) setSelectedSubtopic("");
                }}
                placeholder="Atau tulis sub-topik sendiri"
                className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line px-3 py-2 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
              />
            </div>
          </Field>
        )}

        {/* Rincian Pertanyaan */}
        <Field id="question-detail" label="Jelaskan kendalamu" required helperText="Tuliskan bagian mana yang belum dipahami atau pesan kesalahan yang muncul.">
          <textarea
            id="question-detail"
            rows={4}
            value={questionDetail}
            onChange={(e) => setQuestionDetail(e.target.value)}
            placeholder="Contoh: Saya kesulitan memahami langkah normalisasi pada tabel relasional BCNF..."
            className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line p-3 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 leading-relaxed"
          />
        </Field>

        {/* Tombol Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cw-line">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
            <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{isSubmitting ? "Mengirim..." : "Kirim permintaan"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
