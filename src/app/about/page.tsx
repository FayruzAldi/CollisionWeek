"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Github,
  ExternalLink,
  ArrowRight,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Aldiansyah Fayruz",
      role: "Ketua Tim & Logika Deterministik",
      focus: "Mesin Heuristik Deterministik, Solver Pergeseran Tanggal, Arsitektur Basis Data",
    },
    {
      name: "Khadijah Passa Alkhansa",
      role: "Perekayasa Antarmuka & Desainer UI/UX",
      focus: "Peta Beban 16 Pekan, Antarmuka Bantuan Sebaya, Sistem Token dan Aksesibilitas",
    },
    {
      name: "Khalisha Kaylanasywa",
      role: "Riset Empiris & Uji Pengguna",
      focus: "Survei 53 Mahasiswa, Wawancara 3 Dosen, Protokol Validasi Pengguna Awal",
    },
    {
      name: "Shiti Azzahra Eka Rinaldi",
      role: "Manajer Produk & Dokumentasi",
      focus: "Kepatuhan PRD, Pelacakan Indikator Kinerja, Perencanaan Cakupan, Video Demo",
    },
  ];

  const empiricalSurveyStats = [
    {
      metric: "74%",
      label: "Tugas menumpuk lintas matkul",
      desc: "Menghadapi 3 atau lebih tugas besar jatuh tempo bersamaan di pekan yang sama.",
    },
    {
      metric: "15%",
      label: "Tabrakan ekstrem",
      desc: "Menghadapi 5 tugas besar atau lebih jatuh tempo pada pekan yang sama.",
    },
    {
      metric: "60%",
      label: "Kurang tidur berat",
      desc: "Hanya tidur 5 jam atau kurang per malam pada pekan padat tugas.",
    },
    {
      metric: "62%",
      label: "Tidak tahu siapa yang menguasai",
      desc: "Tidak dapat mengidentifikasi teman sekelas yang sudah memahami sub-topik kendala mereka.",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-7">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cw-line">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-cw-ink">
              Tentang
            </h2>
            <Badge variant="neutral" shape="pill">
              Peserta STACK 2026
            </Badge>
          </div>
          <p className="text-xs text-cw-muted mt-0.5">
            Case 1: Smarter Campus and Learning · Tim &quot;daftar krna gratis&quot;
          </p>
        </div>

        <a
          href="https://github.com/FayruzAldi/CollisionWeek.git"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline" size="sm" type="button">
            <Github className="w-4 h-4" strokeWidth={1.75} />
            <span>Repositori GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-cw-faint ml-0.5" strokeWidth={1.75} />
          </Button>
        </a>
      </div>

      {/* Validasi Empiris */}
      <section className="cw-card p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Survei 53 mahasiswa dari 48 program studi
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Validasi lapangan, November 2026, tentang kebutuhan penyeimbangan beban dan bantuan sebaya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {empiricalSurveyStats.map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-cw-subtle border border-cw-line space-y-1">
              <span className="text-2xl font-semibold text-cw-ink block tabular-nums">
                {stat.metric}
              </span>
              <span className="text-xs font-semibold text-cw-ink block">
                {stat.label}
              </span>
              <p className="text-xs text-cw-muted leading-relaxed">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-cw-subtle border border-cw-line text-xs text-cw-muted leading-relaxed">
          <strong className="text-cw-ink font-semibold">Validasi dosen: </strong>
          Wawancara dengan 3 dosen universitas menegaskan bahwa saat ini tenggat tugas ditentukan tanpa visibilitas lintas mata kuliah. Dosen sangat mendukung sistem yang mengusulkan pergeseran tanggal minimal dengan hak persetujuan satu klik.
        </div>
      </section>

      {/* Rencana Rilis Fitur Berikutnya */}
      <section className="cw-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Peta jalan pengembangan
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Integrasi lanjutan yang direncanakan untuk implementasi penuh di lingkungan kampus
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-cw-line bg-cw-subtle flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cw-accent" strokeWidth={1.75} />
                <h4 className="text-[13px] font-semibold text-cw-ink">
                  Ekstraksi Silabus PDF &amp; Tenggat Otomatis
                </h4>
              </div>
              <p className="text-xs text-cw-muted leading-relaxed">
                Mengekstrak tanggal evaluasi dan kode mata kuliah secara otomatis dari dokumen RPS silabus PDF.
              </p>
            </div>
            <Badge variant="neutral" shape="pill">
              Segera
            </Badge>
          </div>

          <div className="p-4 rounded-xl border border-cw-line bg-cw-subtle flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cw-accent" strokeWidth={1.75} />
                <h4 className="text-[13px] font-semibold text-cw-ink">
                  Sinkronisasi Langsung Moodle &amp; Classroom
                </h4>
              </div>
              <p className="text-xs text-cw-muted leading-relaxed">
                Sinkronisasi berkala melalui API LMS kampus dengan akun SSO mahasiswa dan dosen.
              </p>
            </div>
            <Badge variant="neutral" shape="pill">
              Segera
            </Badge>
          </div>
        </div>
      </section>

      {/* Tim Pengembang */}
      <section className="cw-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Tim &quot;daftar krna gratis&quot;
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Kontributor di balik pengembangan Collision Week
          </p>
        </div>

        <div className="divide-y divide-cw-line">
          {teamMembers.map((member, i) => (
            <div key={i} className="py-3 first:pt-1 last:pb-1 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-cw-accent-soft text-cw-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold text-cw-ink">
                  {member.name}
                </h4>
                <p className="text-xs font-medium text-cw-accent">
                  {member.role}
                </p>
                <p className="text-xs text-cw-muted mt-0.5 leading-relaxed">
                  {member.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deklarasi Determinisme */}
      <section className="cw-card p-6 space-y-3 bg-cw-accent-soft/30 border-cw-accent-line">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cw-accent" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-cw-ink">
            Deklarasi determinisme
          </h3>
        </div>

        <p className="text-xs text-cw-muted leading-relaxed max-w-3xl">
          Sesuai aturan kompetisi, seluruh perhitungan beban, deteksi tabrakan, dan usulan pergeseran tanggal Collision Week berjalan 100% pada heuristik matematis deterministik tanpa model bahasa (LLM). Data demonstrasi bersumber dari dataset sintetis satu semester penuh.
        </p>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="sm" type="button">
              <span>Buka peta beban</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
