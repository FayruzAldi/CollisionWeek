"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Search,
  Zap,
  Plus,
  Bell,
  Upload,
  MessageSquare,
} from "lucide-react";

interface AppHeaderProps {
  onOpenContentModal: () => void;
  onOpenSolverModal: () => void;
}

export function AppHeader({ onOpenContentModal, onOpenSolverModal }: AppHeaderProps) {
  const pathname = usePathname();
  const { currentUser, role } = useRole();

  const navTabs = [
    { href: "/", label: "Heat Map" },
    { href: "/weeks/8", label: "Week Inspector" },
    { href: "/help", label: "Peer Help" },
    { href: "/analytics", label: "Analytics" },
    { href: "/import", label: "Import" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E9ECF2]">
      {/* Main Header Bar — max 72px height */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Solve Collisions pill + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenSolverModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF0FD] text-[#5850EC] hover:bg-[#E0E3FC] text-xs font-bold transition-colors active:scale-[0.98] flex-shrink-0"
          >
            <Zap className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Solve Collisions</span>
          </button>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search assignments, sub-topics..."
              className="w-full text-xs rounded-xl bg-[#F8F9FB] border border-[#E9ECF2] pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30 focus:border-[#5850EC] transition-all"
            />
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/help"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-[0.98]"
            title="Peer Help Board"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          </Link>

          <button
            onClick={onOpenSolverModal}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-[0.98]"
            title="Flagged weeks"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          <Link
            href="/import"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors active:scale-[0.98]"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Upload</span>
          </Link>

          <button
            onClick={onOpenContentModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5850EC] hover:bg-[#4B41DE] text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Action</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar — single line, truncated labels */}
      <div className="px-6 flex items-center gap-5 text-xs font-semibold border-t border-[#F1F3F8] overflow-x-auto">
        {navTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-2.5 border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
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
