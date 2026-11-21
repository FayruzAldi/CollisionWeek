"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Search,
  Sparkles,
  Plus,
  Bell,
  Upload,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface AppHeaderProps {
  onOpenContentModal: () => void;
  onOpenSolverModal: () => void;
}

export function AppHeader({ onOpenContentModal, onOpenSolverModal }: AppHeaderProps) {
  const pathname = usePathname();
  const { currentUser, role } = useRole();

  const navTabs = [
    { href: "/", label: "Semester Heat Map" },
    { href: "/weeks/8", label: "Week Inspector" },
    { href: "/help", label: "Peer Help Board" },
    { href: "/analytics", label: "Lecturer Analytics" },
    { href: "/import", label: "Schedule Ingestion" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E9ECF2]">
      {/* Top Competition Bar */}
      <div className="bg-[#18181B] text-slate-300 px-6 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">GDGoC ITB STACK 2026</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">Case 1: Smarter Campus and Learning</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 italic">Team: daftar krna gratis</span>
        </div>
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% Deterministic Engine (Zero AI/LLM for Scheduling)
          </span>
          <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-900">
            Synthetic Demo Data
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Search & Solver pill */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenSolverModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF0FD] text-[#5850EC] hover:bg-[#E0E3FC] text-xs font-bold transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solve Collisions</span>
          </button>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assignments, sub-topics, courses..."
              className="w-full text-xs rounded-xl bg-[#F8F9FB] border border-[#E9ECF2] pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5850EC]/30 focus:border-[#5850EC] transition-all"
            />
          </div>
        </div>

        {/* Right Action buttons (Matching Image 1 & 2) */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/help"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Messages / Inquiries"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>

          <button
            onClick={onOpenSolverModal}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          <Link
            href="/import"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </Link>

          {/* "+ New Content" Vibrant Purple Button from Image 2 */}
          <button
            onClick={onOpenContentModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Action</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Matching Image 1 "Home | My Learning | Catalog | Favorites") */}
      <div className="px-6 flex items-center gap-6 text-xs font-semibold border-t border-[#F1F3F8]">
        {navTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-2.5 border-b-2 transition-all ${
                isActive
                  ? "border-[#5850EC] text-[#5850EC] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
