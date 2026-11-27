"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Megaphone, Calculator, MessageCircleHeart } from "lucide-react";

export type MascotPersonaId = "umk" | "binus" | "telkom";

export interface MascotPersonaMeta {
  id: MascotPersonaId;
  name: string;
  campus: string;
  title: string;
  roleBadge: string;
  callout: string;
  calloutBg: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  description: string;
  duties: string[];
  heroPose: string;
  poses: { file: string; label: string }[];
}

export const MASCOT_PERSONAS: Record<MascotPersonaId, MascotPersonaMeta> = {
  umk: {
    id: "umk",
    name: "WIRA",
    campus: "Universitas Muria Kudus",
    title: "Academic Newsman & Announcer",
    roleBadge: "WIRA · Newsman UMK",
    callout: "TERBANG TINGGI!",
    calloutBg: "bg-[#C8941D] text-[#12141A]",
    accentBg: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
    description:
      "Penyiar buletin akademik yang memantau peta beban 16 pekan dan mengumumkan peringatan dini saat tugas besar menumpuk di satu pekan.",
    duties: [
      "Menyiarkan ringkasan beban mingguan di dasbor",
      "Memberi peringatan dini pekan kritis (Cw ≥ 3)",
      "Menyampaikan status keseimbangan semester",
    ],
    heroPose: "peer-help.webp",
    poses: [
      { file: "stress.webp", label: "Siaga Tabrakan" },
      { file: "calculating.webp", label: "Menganalisis" },
      { file: "reading.webp", label: "Membaca Panduan" },
      { file: "success.webp", label: "Jadwal Seimbang" },
    ],
  },
  binus: {
    id: "binus",
    name: "Cody",
    campus: "BINUS University",
    title: "Deterministic Schedule Assistant",
    roleBadge: "Cody · Assistant BINUS",
    callout: "SIAP HITUNG!",
    calloutBg: "bg-[#F59E0B] text-[#12141A]",
    accentBg: "bg-amber-50",
    accentText: "text-amber-800",
    accentBorder: "border-amber-200",
    description:
      "Asisten kalkulasi deterministik yang membantu dosen dan admin memvalidasi impor CSV serta menghitung pergeseran tenggat paling ringan.",
    duties: [
      "Memandu unggah & validasi berkas CSV jadwal",
      "Menghitung opsi geser tenggat tanpa bentrok baru",
      "Menjaga aturan hak akses pengampu mata kuliah",
    ],
    heroPose: "calculating.webp",
    poses: [
      { file: "calculating.webp", label: "Kalkulasi Solver" },
      { file: "working.webp", label: "Memproses Data" },
      { file: "success.webp", label: "Impor Sukses" },
      { file: "resolved.webp", label: "Terselesaikan" },
    ],
  },
  telkom: {
    id: "telkom",
    name: "PUTI",
    campus: "Telkom University",
    title: "Peer-Help & Learning Companion",
    roleBadge: "PUTI · Companion Telkom",
    callout: "BANTU YUK!",
    calloutBg: "bg-[#E11D48] text-white",
    accentBg: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
    description:
      "Fasilitator belajar sebaya yang menghubungkan mahasiswa yang kesulitan sub-topik dengan teman sekelas yang siap berbagi video, catatan, atau sesi 20 menit.",
    duties: [
      "Menyorot pertanyaan mendesak (>12 jam tanpa balasan)",
      "Mengajak mahasiswa berbagi tautan video & panduan",
      "Memandu diskusi sub-topik pada setiap tugas",
    ],
    heroPose: "peer-help.webp",
    poses: [
      { file: "peer-help.webp", label: "Bantuan Sebaya" },
      { file: "sharing.webp", label: "Belajar Bersama" },
      { file: "reading.webp", label: "Membaca Panduan" },
      { file: "success.webp", label: "Masalah Selesai" },
    ],
  },
};

export function MascotCalloutBubble({
  text,
  bgClass,
}: {
  text: string;
  bgClass: string;
}) {
  return (
    <div className="relative inline-flex flex-col items-center mb-1">
      <span
        className={`relative z-10 inline-block whitespace-nowrap rounded-full border-2 border-[#12141A] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-[2px_2px_0_#12141A] ${bgClass}`}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className={`w-2.5 h-2.5 rotate-45 -mt-1.5 border-r-2 border-b-2 border-[#12141A] ${bgClass}`}
      />
    </div>
  );
}

interface MascotBannerProps {
  persona: MascotPersonaId;
  pose: string;
  headline: string;
  message: string;
  callout?: string;
  badgeText?: string;
  tone?: "default" | "warning" | "success";
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function MascotBanner({
  persona,
  pose,
  headline,
  message,
  callout,
  badgeText,
  tone = "default",
  actionLabel,
  actionHref,
  onActionClick,
}: MascotBannerProps) {
  const meta = MASCOT_PERSONAS[persona];
  const bubbleText = callout || meta.callout;

  const containerStyle =
    tone === "warning"
      ? "bg-amber-50/75 border-amber-200/80"
      : tone === "success"
      ? "bg-emerald-50/75 border-emerald-200/80"
      : "bg-cw-surface border-cw-line";

  const RoleIcon =
    persona === "umk"
      ? Megaphone
      : persona === "binus"
      ? Calculator
      : MessageCircleHeart;

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden transition-colors ${containerStyle}`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 w-full sm:w-auto">
        {/* Maskot tanpa bingkai kotak — berdiri bebas dengan drop-shadow & speech pill */}
        <div className="flex flex-col items-center flex-shrink-0">
          <MascotCalloutBubble text={bubbleText} bgClass={meta.calloutBg} />
          <div className="relative w-16 h-16 sm:w-24 sm:h-24">
            <Image
              src={`/mascots/${persona}/${pose}`}
              alt={`${meta.name} (${meta.title})`}
              fill
              className="object-contain drop-shadow-[5px_5px_0_rgba(18,20,26,0.16)]"
              unoptimized
            />
          </div>
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.accentBg} ${meta.accentText} ${meta.accentBorder}`}
            >
              <RoleIcon className="w-3 h-3" strokeWidth={2} />
              <span>{badgeText || meta.roleBadge}</span>
            </span>
          </div>
          <p className="text-[14px] font-semibold text-cw-ink leading-snug">
            {headline}
          </p>
          <p className="text-xs text-cw-muted leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {actionLabel && (actionHref || onActionClick) && (
        <div className="self-end sm:self-center flex-shrink-0">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cw-surface border border-cw-line text-xs font-semibold text-cw-accent hover:bg-cw-accent-soft/60 transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cw-surface border border-cw-line text-xs font-semibold text-cw-accent hover:bg-cw-accent-soft/60 transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Adegan komunikasi antar 3 maskot untuk halaman Tentang (/about),
 * memperlihatkan bagaimana WIRA (UMK), Cody (BINUS), dan PUTI (Telkom)
 * saling berkolaborasi dalam alur kerja Collision Week.
 */
export function MascotDialogueShowcase() {
  const messages = [
    {
      persona: "umk" as MascotPersonaId,
      pose: "stress.webp",
      callout: "SIAGA PEKAN!",
      side: "left",
      speaker: "WIRA · Academic Newsman (UMK)",
      text: "Breaking news kampus! Di Pekan 10 terdeteksi 3 tugas besar jatuh tempo di minggu yang sama. Beban mahasiswa melonjak tajam!",
    },
    {
      persona: "binus" as MascotPersonaId,
      pose: "calculating.webp",
      callout: "CEK SOLVER!",
      side: "right",
      speaker: "Cody · Schedule Assistant (BINUS)",
      text: "Tenang, WIRA! Aku sudah hitung secara deterministik: menggeser satu tugas besar ke Pekan 11 menurunkan bentrok tanpa memicu tabrakan baru. Dosen pengampu tinggal klik Terapkan.",
    },
    {
      persona: "telkom" as MascotPersonaId,
      pose: "peer-help.webp",
      callout: "BANTU YUK!",
      side: "left",
      speaker: "PUTI · Peer-Help Companion (Telkom)",
      text: "Sementara jadwal diseimbangkan, aku juga menghubungkan mahasiswa yang kesulitan sub-topik lewat Bantuan Sebaya — bisa berbagi tautan video, panduan tulisan, atau sesi 20 menit!",
    },
    {
      persona: "umk" as MascotPersonaId,
      pose: "success.webp",
      callout: "TERBANG TINGGI!",
      side: "right",
      speaker: "WIRA · Academic Newsman (UMK)",
      text: "Mantap! Pekan kembali aman, jadwal belajar seimbang, dan kolaborasi kelas makin solid.",
    },
  ];

  return (
    <div className="cw-card p-5 sm:p-6 space-y-4">
      <div className="pb-2 border-b border-cw-line">
        <h4 className="text-sm font-semibold text-cw-ink">
          Bagaimana Ketiga Maskot Saling Bekerja Sama
        </h4>
        <p className="text-xs text-cw-muted mt-0.5">
          Simulasi komunikasi singkat antara WIRA (Newsman), Cody (Schedule Assistant), dan PUTI (Peer-Help Companion) saat pekan kritis terdeteksi.
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m, idx) => {
          const meta = MASCOT_PERSONAS[m.persona];
          const isRight = m.side === "right";
          return (
            <div
              key={idx}
              className={`flex items-end gap-3.5 ${isRight ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <MascotCalloutBubble text={m.callout} bgClass={meta.calloutBg} />
                <div className="relative w-16 h-16">
                  <Image
                    src={`/mascots/${m.persona}/${m.pose}`}
                    alt={m.speaker}
                    fill
                    className="object-contain drop-shadow-[4px_4px_0_rgba(18,20,26,0.16)]"
                    unoptimized
                  />
                </div>
              </div>

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 border space-y-1 ${
                  isRight
                    ? "bg-cw-accent-soft/40 border-cw-accent-line rounded-br-sm"
                    : "bg-cw-subtle border-cw-line rounded-bl-sm"
                }`}
              >
                <span className={`text-[11px] font-semibold block ${meta.accentText}`}>
                  {m.speaker}
                </span>
                <p className="text-xs text-cw-ink leading-relaxed">{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
