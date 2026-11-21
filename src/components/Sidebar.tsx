"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Calendar,
  AlertTriangle,
  Users,
  BarChart3,
  Upload,
  Info,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Zap,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  onOpenContentModal: () => void;
  onOpenSolverModal: () => void;
}

export function Sidebar({ onOpenContentModal, onOpenSolverModal }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser, role } = useRole();
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/", label: "Semester Heat Map", icon: Calendar },
    { href: "/weeks/8", label: "Week Inspector", icon: AlertTriangle },
    { href: "/help", label: "Peer Help Board", icon: Users },
    { href: "/analytics", label: "Lecturer Analytics", icon: BarChart3 },
    { href: "/import", label: "Schedule Ingestion", icon: Upload },
    { href: "/about", label: "About & Team", icon: Info },
  ];

  const courses = [
    { code: "IF2110", name: "Database Systems", color: "#2563EB" },
    { code: "IF2120", name: "Software Engineering", color: "#059669" },
    { code: "IF2130", name: "Computer Networks", color: "#7C3AED" },
    { code: "IF2140", name: "Design & Analysis of Algorithms", color: "#D97706" },
    { code: "IF2150", name: "Operating Systems", color: "#DB2777" },
    { code: "IF2160", name: "Artificial Intelligence", color: "#0891B2" },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E9ECF2] min-h-[100dvh] sticky top-0 flex flex-col justify-between transition-all duration-200 z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand & Header */}
      <div>
        <div className="p-4 px-5 flex items-center justify-between border-b border-[#F1F3F8]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5850EC] flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-indigo-500/30 flex-shrink-0">
              cw
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight block leading-tight">
                  collision week
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  academic load balance
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.98]"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#EEF0FD] text-[#5850EC]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#5850EC]" : "text-slate-400"}`} strokeWidth={isActive ? 2 : 1.5} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Courses Accordion */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-[#F1F3F8] mt-1">
            <button
              onClick={() => setCoursesOpen(!coursesOpen)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-600 py-1.5"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                Courses ({courses.length})
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${coursesOpen ? "rotate-0" : "-rotate-90"}`} strokeWidth={1.5} />
            </button>

            {coursesOpen && (
              <div className="space-y-0.5 mt-1 max-h-40 overflow-y-auto pr-1">
                {courses.map((c) => (
                  <Link
                    key={c.code}
                    href={`/help?courseCode=${c.code}`}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    ></span>
                    <span className="truncate">{c.code} {c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Area: Promo Card & User Switcher */}
      <div className="p-3 border-t border-[#F1F3F8] space-y-2.5">
        {/* Deterministic Solver promo card */}
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#F5F6FE] to-[#EEF0FD] border border-[#E0E3FC] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#5850EC]">
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Deterministic Solver</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Calculates minimal date shifts to balance peak crunches without new collisions.
            </p>
            <button
              onClick={onOpenSolverModal}
              className="text-[11px] font-bold text-[#5850EC] hover:text-[#4B41DE] flex items-center gap-1 pt-0.5 active:scale-[0.98] transition-transform"
            >
              <span>Solve Collisions</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* User Profile & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-all bg-white active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#5850EC] font-black text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.charAt(0) || "U"
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser?.name || "Loading..."}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  <span className="font-bold text-[#5850EC] uppercase">{role}</span>
                </p>
              </div>
            )}
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />}
          </button>

          {userDropdownOpen && (
            <div
              className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400">
                  Switch Persona (Demo)
                </p>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {users.map((u) => {
                  const isSelected = u.id === currentUser?.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-xs ${
                        isSelected ? "bg-indigo-50/60 font-semibold text-[#5850EC]" : "text-slate-700"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </span>
                      <div className="flex-1 truncate">
                        <span className="block truncate">{u.name}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">{u.role}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Competition context — moved from the dark top bar */}
        {!isCollapsed && (
          <p className="text-[9px] text-slate-400 text-center leading-relaxed px-1">
            GDGoC ITB STACK 2026 · Case 1: Smarter Campus and Learning
          </p>
        )}
      </div>
    </aside>
  );
}
