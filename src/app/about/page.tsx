"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Award,
  BookOpen,
  PieChart,
  Github,
  CheckCircle,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Aldiansyah Fayruz",
      role: "Team Leader & Core Deterministic Logic",
      focus: "Deterministic Heuristic Engine, Minimal Date Move Solver, Database Architecture",
    },
    {
      name: "Khadijah Passa Alkhansa",
      role: "Frontend Engineer & UI/UX Designer",
      focus: "16-Week Semester Heat Map, Sub-topic Peer Help Interfaces, High-Contrast Palette",
    },
    {
      name: "Khalisha Kaylanasywa",
      role: "Research, Empirical Data & User Testing",
      focus: "53-Student Survey, 3 Lecturer Interviews, Early User Validation Protocol",
    },
    {
      name: "Shiti Azzahra Eka Rinaldi",
      role: "Product Manager, Proposal & Video Director",
      focus: "PRD Compliance, KPI Tracking, Final Day Scope Planning, Demonstration Video",
    },
  ];

  const empiricalSurveyStats = [
    {
      metric: "74%",
      label: "Multi-Course Clustering",
      desc: "Had ≥3 major assignments due in a single week across different courses.",
    },
    {
      metric: "15%",
      label: "Extreme Collision",
      desc: "Faced 5 or more major assignments due simultaneously in one week.",
    },
    {
      metric: "60%",
      label: "Severe Sleep Deprivation",
      desc: "Slept 5 hours or less per night during assignment collision crunch weeks.",
    },
    {
      metric: "62%",
      label: "Knowledge Asymmetry",
      desc: "Could not identify who in class had mastered the specific sub-topic they were stuck on.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            GDGoC ITB STACK 2026 Submission
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            About Collision Week &amp; Team
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Case 1: <em>Smarter Campus and Learning</em> — <em>&quot;Agent of the Ocean: Vibing Beyond the Code&quot;</em>.
            Designed and engineered by team <strong>daftar krna gratis</strong>.
          </p>
        </div>
      </div>

      {/* Empirical Research Evidence (PRD Section 2.2) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            PRD Section 2.2
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Empirical Validation: Survey of 53 Students &amp; 3 Lecturers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conducted in November 2026 across 48 university study programs to substantiate problem significance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {empiricalSurveyStats.map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-black text-slate-900 block">{stat.metric}</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{stat.label}</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
          <strong>Lecturer Interview Findings:</strong> All 3 interviewed university lecturers confirmed
          that deadline scheduling across courses is currently informal without an overarching aggregated calendar,
          resulting in accidental deadline clashes. Lecturers strongly favored a tool providing
          <em> minimal date moves</em> with 1-click approval authority.
        </div>
      </section>

      {/* Team Roster */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Development Team: &quot;daftar krna gratis&quot;
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Core contributors behind Collision Week for STACK 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                <p className="text-xs font-semibold text-sky-700">{member.role}</p>
                <p className="text-xs text-slate-500 mt-1">{member.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Competition Transparency & Deterministic Guarantee */}
      <section className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">
            Competition Transparency &amp; Determinism Declaration
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          In strict compliance with STACK 2026 guidelines, <strong>Collision Week&apos;s load balancing,
          collision detection, and minimal date move recommendations run on 100% deterministic mathematical heuristics</strong> (no LLM/AI).
          All demonstration data is explicitly labeled as synthetic, and unfinished features are cordoned off as official Final Day Milestones.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
          <a
            href="https://github.com/FayruzAldi/CollisionWeek.git"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub: FayruzAldi/CollisionWeek</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 font-semibold transition-colors"
          >
            <span>Explore 16-Week Heat Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
