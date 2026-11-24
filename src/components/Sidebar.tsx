"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Upload,
  ChevronDown,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
} from "lucide-react";

interface SidebarProps {
  onOpenSolverModal: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  onOpenSolverModal,
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser, role } = useRole();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserDropdownOpen(false);
  }, [isCollapsed, isMobileOpen]);

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!roleDropdownRef.current?.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [userDropdownOpen]);

  const navItems = [
    { href: "/", label: "Peta Beban", icon: LayoutDashboard },
    { href: "/weeks/8", label: "Pekan Kritis", icon: CalendarDays, badge: 2 },
    { href: "/help", label: "Bantuan Sebaya", icon: Users },
    { href: "/analytics", label: "Analitik Dosen", icon: BarChart3 },
    { href: "/import", label: "Impor Jadwal", icon: Upload },
    { href: "/about", label: "Tentang", icon: Info },
  ];

  const favorites = [
    { href: "/weeks/8", label: "Pekan 8" },
    { href: "/weeks/14", label: "Pekan 14" },
    { href: "/help", label: "Bantuan Saya" },
  ];

  const content = (
    <div className={`w-[264px] ${isCollapsed ? "lg:w-16 lg:px-2 lg:py-4" : "lg:w-[264px] lg:p-4"} bg-cw-surface border-r border-cw-line h-dvh sticky top-0 flex flex-col justify-between p-4 z-20 overflow-y-auto transition-[width,padding] duration-200`}>
      {/* Top Section */}
      <div className="space-y-6">
        {/* Workspace Title */}
        <div className="pb-2 border-b border-cw-line flex items-center justify-between gap-2">
          <div className={isCollapsed ? "lg:hidden" : ""}>
            <h2 className="text-base font-semibold text-cw-ink">Ruang Akademik</h2>
            <p className="text-xs text-cw-faint mt-0.5">
              Teknik Informatika · Semester Ganjil
            </p>
          </div>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={isCollapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
              title={isCollapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
              className="hidden lg:flex w-8 h-8 flex-shrink-0 rounded-lg text-cw-faint hover:text-cw-ink hover:bg-cw-sunken items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>

        <nav className="space-y-1" aria-label="Navigasi utama">
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
                onClick={onMobileClose}
                title={item.label}
                className={`h-10 rounded-xl text-[13px] font-medium transition-colors flex items-center ${
                  isCollapsed
                    ? "lg:w-10 lg:justify-center lg:px-0"
                    : "px-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-cw-sunken text-cw-ink font-semibold"
                    : "text-cw-muted hover:text-cw-ink hover:bg-cw-subtle"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className={isCollapsed ? "lg:hidden" : "truncate"}>
                    {item.label}
                  </span>
                </span>
                {item.badge && !isCollapsed && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semantic-danger-soft text-semantic-danger-fg">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Favorit */}
        <div className={`${isCollapsed ? "lg:hidden" : ""} space-y-1.5`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-cw-faint">FAVORIT</span>
            <span className="text-xs text-cw-faint">3</span>
          </div>
          <div className="space-y-0.5">
            {favorites.map((fav) => (
              <Link
                key={fav.href + fav.label}
                href={fav.href}
                onClick={onMobileClose}
                className="block px-2.5 py-1.5 rounded-xl text-xs text-cw-muted hover:text-cw-ink hover:bg-cw-subtle transition-colors"
              >
                {fav.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Proyek / Program */}
        <div className={`${isCollapsed ? "lg:hidden" : ""} space-y-1.5`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-cw-faint">PROYEK</span>
            <span className="text-xs text-cw-faint">1</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-cw-ink bg-cw-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-cw-accent flex-shrink-0" />
            <span className="truncate">Teknik Informatika</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-4 border-t border-cw-line">
        {/* Promo card: Solver Deterministik */}
        <div className={`${isCollapsed ? "lg:hidden" : ""} rounded-2xl bg-cw-subtle border border-cw-line p-3.5 space-y-1.5`}>
          <h4 className="text-[13px] font-semibold text-cw-ink">
            Solver Deterministik
          </h4>
          <p className="text-xs text-cw-muted leading-relaxed">
            Menghitung pergeseran tanggal terkecil untuk menurunkan puncak beban
            tanpa tabrakan baru.
          </p>
          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              onOpenSolverModal();
            }}
            type="button"
            className="text-xs font-semibold text-cw-accent hover:text-cw-accent-hover flex items-center gap-1 pt-0.5"
          >
            <span>Jalankan</span>
            <span>→</span>
          </button>
        </div>

        {/* Ganti Peran Demo */}
        <div ref={roleDropdownRef} className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            type="button"
            title={currentUser?.name || "Pengguna"}
            className={`h-12 flex items-center rounded-xl border border-cw-line bg-cw-surface hover:bg-cw-subtle text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
              isCollapsed ? "w-12 justify-center p-1" : "w-full justify-between p-2"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cw-accent-soft text-cw-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
                <UserCheck className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className={`${isCollapsed ? "lg:hidden" : ""} truncate`}>
                <p className="text-xs font-semibold text-cw-ink truncate">
                  {currentUser?.name || "Memuat..."}
                </p>
                <p className="text-[11px] text-cw-faint truncate">
                  Peran: {role === "ADMIN" ? "Admin" : role === "LECTURER" ? "Dosen" : "Mahasiswa"}
                </p>
              </div>
            </div>
            <ChevronDown className={`${isCollapsed ? "lg:hidden" : ""} w-4 h-4 text-cw-faint flex-shrink-0`} strokeWidth={1.75} />
          </button>

          {userDropdownOpen && (
            <div
              className={`absolute bottom-full left-0 mb-2 w-full bg-cw-surface rounded-2xl shadow-modal border border-cw-line py-2 z-50 lg:fixed lg:bottom-4 lg:mb-0 lg:w-64 ${
                isCollapsed ? "lg:left-[72px]" : "lg:left-[272px]"
              }`}
            >
              <div className="px-3 py-1.5 border-b border-cw-line">
                <p className="text-[11px] font-medium text-cw-faint">
                  Ganti peran (demo)
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setUserDropdownOpen(false);
                    }}
                    type="button"
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-cw-subtle ${
                      u.id === currentUser?.id
                        ? "text-cw-accent font-semibold bg-cw-accent-soft/40"
                        : "text-cw-ink"
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[11px] text-cw-faint ml-2 flex-shrink-0">
                      {u.role === "ADMIN" ? "Admin" : u.role === "LECTURER" ? "Dosen" : "Mhs"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block flex-shrink-0">{content}</div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-cw-ink/40 backdrop-blur-[2px]"
            onClick={onMobileClose}
          />
          <div className="relative z-50 animate-scale-in">{content}</div>
        </div>
      )}
    </>
  );
}
