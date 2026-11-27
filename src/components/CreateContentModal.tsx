"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Layers,
  Clock,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useRole } from "@/context/RoleContext";

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
  const { role, can } = useRole();
  const isStudent = role === "STUDENT";

  const contentOptions = [
    {
      id: "help-request",
      title: "Minta bantuan sebaya",
      description: "Ajukan pertanyaan spesifik pada satu sub-topik tugas.",
      icon: Users,
      badge: null,
      show: true,
      action: () => {
        onClose();
        onOpenHelpModal();
      },
    },
    {
      id: "date-solver",
      title: isStudent ? "Ajukan geser tanggal ke dosen" : "Geser tanggal (Solver)",
      description: isStudent
        ? "Pilih tugas padat dan kirim usulan pergeseran beserta alasan ke dosen."
        : "Jalankan solver untuk menyeimbangkan pekan padat.",
      icon: Calendar,
      badge: isStudent ? "Usulan" : "Deterministik",
      show: true,
      action: () => {
        onClose();
        onOpenSolverModal();
      },
    },
    {
      id: "csv-import",
      title: "Impor CSV",
      description: "Unggah tenggat tugas untuk memetakan 16 pekan.",
      icon: Layers,
      badge: null,
      show: can("schedule.import"),
      action: () => {
        onClose();
        router.push("/import");
      },
    },
    {
      id: "analytics",
      title: "Lihat analitik",
      description: "Lihat sub-topik dengan kendala terbanyak.",
      icon: BarChart3,
      badge: null,
      show: can("analytics.view"),
      action: () => {
        onClose();
        router.push("/analytics");
      },
    },
    {
      id: "reset-demo",
      title: "Atur ulang data",
      description: "Kembalikan data demo 16 pekan.",
      icon: RotateCcw,
      badge: null,
      show: can("demo.reset"),
      action: () => {
        onClose();
        router.push("/import");
      },
    },
  ].filter((opt) => opt.show);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat baru"
      description="Pilih tindakan yang ingin kamu jalankan di ruang akademik."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {contentOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={opt.action}
              type="button"
              className="p-3.5 rounded-2xl border border-cw-line bg-cw-surface hover:bg-cw-subtle hover:border-cw-accent-line text-left transition-colors flex items-start gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
            >
              <div className="w-8 h-8 rounded-lg bg-cw-accent-soft text-cw-accent flex items-center justify-center flex-shrink-0 group-hover:bg-cw-accent group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-[13px] font-semibold text-cw-ink truncate">
                    {opt.title}
                  </h4>
                  {opt.badge && (
                    <Badge variant="neutral" shape="pill">
                      {opt.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-cw-muted leading-relaxed line-clamp-2">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-5 mt-4 border-t border-cw-line">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">
          Batal
        </Button>
      </div>
    </Modal>
  );
}
