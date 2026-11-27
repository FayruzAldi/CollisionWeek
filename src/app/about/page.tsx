"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { CWMascot, UniversityLogos } from "@/components/UniversityAssets";
import {
  MASCOT_PERSONAS,
  MascotCalloutBubble,
  MascotDialogueShowcase,
  MascotPersonaId,
} from "@/components/MascotCommunicator";

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

      {/* Maskot & Ekosistem Kampus */}
      <section className="cw-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CWMascot mood="happy" size={72} className="flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-cw-ink">
              Maskot &amp; Ekosistem Kampus Mitra
            </h3>
            <p className="text-xs text-cw-muted max-w-xl leading-relaxed">
              Collision Week dirancang untuk membantu mahasiswa dan dosen lintas perguruan tinggi Indonesia mengelola puncak tenggat tugas agar lebih sehat dan kolaboratif.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <UniversityLogos layout="row" size="lg" variant="plain" />
        </div>
      </section>

      {/* Maskot Komunikator Digital & Penjelasannya */}
      <section className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Tim Maskot Digital &amp; Peran Komunikator
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Tiga karakter maskot mitra kampus bertugas sebagai penyiar buletin, asisten penjadwalan, dan pendamping belajar sebaya di sepanjang aplikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["umk", "binus", "telkom"] as MascotPersonaId[]).map((id) => {
            const p = MASCOT_PERSONAS[id];
            return (
              <div key={id} className="cw-card p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <MascotCalloutBubble text={p.callout} bgClass={p.calloutBg} />
                      <div className="relative w-24 h-24">
                        <Image
                          src={`/mascots/${p.id}/${p.heroPose}`}
                          alt={`${p.name} - ${p.campus}`}
                          fill
                          className="object-contain drop-shadow-[5px_5px_0_rgba(18,20,26,0.16)]"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.accentBg} ${p.accentText} ${p.accentBorder}`}
                      >
                        {p.roleBadge}
                      </span>
                      <h4 className="text-base font-semibold text-cw-ink truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-cw-faint truncate">{p.campus}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-cw-accent">{p.title}</p>
                  <p className="text-xs text-cw-muted leading-relaxed">{p.description}</p>

                  <ul className="space-y-1 pt-1">
                    {p.duties.map((duty, dIdx) => (
                      <li key={dIdx} className="text-[11px] text-cw-muted flex items-start gap-1.5">
                        <span className="text-cw-accent font-bold">•</span>
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Galeri mini 4 ekspresi */}
                <div className="pt-3 border-t border-cw-line space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cw-faint block">
                    Ekspresi Utama
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {p.poses.map((pose) => (
                      <div key={pose.file} className="text-center space-y-1" title={pose.label}>
                        <div className="relative aspect-square">
                          <Image
                            src={`/mascots/${p.id}/${pose.file}`}
                            alt={`${p.name} ${pose.label}`}
                            fill
                            className="object-contain drop-shadow-[3px_3px_0_rgba(18,20,26,0.14)]"
                            unoptimized
                          />
                        </div>
                        <span className="text-[10px] text-cw-faint block truncate">
                          {pose.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <MascotDialogueShowcase />
      </section>

      {/* Validasi Empiris */}
      <section className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-cw-ink">
            Survei 53 mahasiswa dari 48 program studi
          </h3>
          <p className="text-xs text-cw-muted mt-0.5">
            Validasi lapangan, November 2026, tentang kebutuhan penyeimbangan beban dan bantuan sebaya.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-cw-line border-y border-cw-line">
          {empiricalSurveyStats.map((stat, i) => (
            <div key={i} className="px-4 py-5 first:pl-0 last:pr-0 space-y-1">
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
      <section className="space-y-4">
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
      <section className="space-y-4">
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
              <div className="w-8 h-8 rounded-xl bg-cw-accent-soft text-cw-accent flex items-center justify-center font-semibold text-xs flex-shrink-0">
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
