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
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser, role } = useRole();
  const [isResetting, setIsResetting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleReset = async () => {
    if (!confirm("Reset database to initial synthetic demonstration dataset?")) return;
    try {
      setIsResetting(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to reset database");
      }
    } catch {
      alert("Error resetting database");
    } finally {
      setIsResetting(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Semester Heat Map", icon: Calendar },
    { href: "/weeks/8", label: "Week Inspector", icon: AlertTriangle },
    { href: "/help", label: "Peer Help Board", icon: Users },
    { href: "/analytics", label: "Lecturer Analytics", icon: BarChart3 },
    { href: "/import", label: "CSV Ingestion", icon: Upload },
    { href: "/about", label: "About & Evidence", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner: GDGoC ITB Competition & Compliance */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GDGoC ITB STACK 2026
          </span>
          <span className="text-slate-500">•</span>
          <span>Case 1: Smarter Campus & Learning</span>
          <span className="text-slate-500">•</span>
          <span className="italic text-slate-400">Team: daftar krna gratis</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            100% Deterministic Engine (No AI/LLM for Scheduling)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
            Synthetic Demo Data
          </span>
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset data to initial state"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
            {isResetting ? "Resetting..." : "Reset Demo"}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-tight">CW</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  Collision Week
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                  Semifinal v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Academic Load Balancing & Sub-topic Peer Help
              </p>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-blue-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Persona / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm text-left transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold overflow-hidden border border-slate-200 text-xs">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name.charAt(0) || "U"
                )}
              </div>
              <div className="hidden lg:block text-xs leading-tight">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  {currentUser?.name || "Loading..."}
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  Role: <span className="text-blue-600 uppercase font-bold">{role}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">
                    Switch Persona (Judge Testing)
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    const roleColor =
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "LECTURER"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";

                    return (
                      <button
                        key={u.id}
                        onClick={() => setCurrentUser(u)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/70" : ""
                        }`}
                      >
                        <div className="w-7 h-7 rounded-md bg-slate-200 overflow-hidden flex-shrink-0 text-xs flex items-center justify-center font-bold">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${roleColor}`}
                        >
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
                  <p className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Allows testing all user flows without credentials.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
