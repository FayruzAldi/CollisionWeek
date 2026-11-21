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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              About Collision Week &amp; Team
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              STACK 2026 Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Case 1: Smarter Campus and Learning • Team &quot;daftar krna gratis&quot;
          </p>
        </div>

        <a
          href="https://github.com/FayruzAldi/CollisionWeek.git"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repository</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

      {/* Empirical Research Evidence (PRD Section 2.2) */}
      <section className="trenning-card p-6 space-y-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            PRD Section 2.2 Empirical Research
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1.5">
            Survey of 53 University Students Across 48 Study Programs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical validation conducted in November 2026 proving the critical necessity of load balancing and sub-topic peer assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {empiricalSurveyStats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#F8F9FB] border border-[#E9ECF2]">
              <span className="text-3xl font-black text-slate-900 block leading-tight">{stat.metric}</span>
              <span className="font-bold text-slate-800 text-xs block mt-1">{stat.label}</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
          <strong>Lecturer Validation:</strong> Semi-structured interviews with 3 university lecturers confirmed
          that assignment deadlines are currently set with zero cross-course visibility. Lecturers strongly favored
          a system that proposes <em>minimal date shifts</em> with one-click approval authority.
        </div>
      </section>

      {/* Team Roster */}
      <section className="trenning-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Team &quot;daftar krna gratis&quot;
          </h2>
          <p className="text-xs text-slate-500">
            Contributors behind Collision Week for GDGoC ITB STACK 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-[#FAFBFD] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{member.name}</h4>
                <p className="text-xs font-semibold text-[#5850EC]">{member.role}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{member.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Competition Compliance & Deterministic Guarantee */}
      <section className="trenning-card p-6 space-y-3 bg-slate-900 text-white border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-white text-base">
            Competition Transparency &amp; Determinism Declaration
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          In strict compliance with STACK 2026 rules, <strong>Collision Week&apos;s load calculations,
          collision detection, and minimal date move recommendations run on 100% deterministic mathematical heuristics</strong> (no AI/LLM).
          All demonstration data is explicitly synthetic, and unfinished features are cordoned off as official Final Day Milestones.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Explore 16-Week Heat Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
