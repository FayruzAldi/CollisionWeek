"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Upload,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  LogOut,
  Repeat,
} from "lucide-react";
import { ROLE_LABEL } from "@/lib/permissions";
import { UserAvatar } from "./ui/UserAvatar";

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
  const router = useRouter();
  const { currentUser, role, can, logout } = useRole();
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

  /**
   * Menu diturunkan dari capability, bukan daftar tetap. Menambah peran baru
   * cukup di lib/permissions.ts; sidebar ikut menyesuaikan.
   */
  const navItems = [
    { href: "/", label: "Peta Beban", icon: LayoutDashboard, show: can("dashboard.view") },
    { href: "/weeks/10", label: "Pekan Kritis", icon: CalendarDays, badge: 3, show: can("week.view") },
    { href: "/help", label: "Bantuan Sebaya", icon: Users, show: can("help.view") },
    { href: "/analytics", label: "Analitik Dosen", icon: BarChart3, show: can("analytics.view") },
    { href: "/import", label: "Impor Jadwal", icon: Upload, show: can("import.view") },
    { href: "/about", label: "Tentang", icon: Info, show: true },
  ].filter((item) => item.show);

  const favorites = [
    { href: "/weeks/10", label: "Pekan 10" },
    { href: "/weeks/14", label: "Pekan 14" },
    { href: "/help", label: "Bantuan Saya" },
  ];

  const handleSwitchAccount = async () => {
    await logout();
    if (onMobileClose) onMobileClose();
    router.replace("/login");
  };

  const content = (
    <div className={`w-[264px] ${isCollapsed ? "lg:w-16 lg:px-2 lg:py-4" : "lg:w-[264px] lg:p-4"} bg-cw-surface border-r border-cw-line h-dvh sticky top-0 flex flex-col justify-between p-4 z-20 overflow-y-auto transition-[width,padding] duration-200`}>
      <div className="space-y-6">
        <div className="pb-2 border-b border-cw-line flex items-center justify-between gap-2">
          <div className={isCollapsed ? "lg:hidden" : ""}>
            <h2 className="text-base font-semibold text-cw-ink">Ruang Akademik</h2>
            <p className="text-xs text-cw-faint mt-0.5 truncate">
              {currentUser?.program?.name || "Lintas Jurusan"} · Semester Genap
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
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={item.label}
                className={`h-10 rounded-xl text-[13px] font-medium transition-colors flex items-center ${
                  isCollapsed ? "lg:w-10 lg:justify-center lg:px-0" : "px-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-cw-sunken text-cw-ink font-semibold"
                    : "text-cw-muted hover:text-cw-ink hover:bg-cw-subtle"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className={isCollapsed ? "lg:hidden" : "truncate"}>{item.label}</span>
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

        <div className={`${isCollapsed ? "lg:hidden" : ""} space-y-1.5`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-cw-faint">FAVORIT</span>
            <span className="text-xs text-cw-faint">{favorites.length}</span>
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

        <div className={`${isCollapsed ? "lg:hidden" : ""} space-y-1.5`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-cw-faint">PROYEK</span>
            <span className="text-xs text-cw-faint">1</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-cw-ink bg-cw-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-cw-accent flex-shrink-0" />
            <span className="truncate">{currentUser?.program?.name || "Lintas Jurusan"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-cw-line">
        {can("schedule.move") && (
          <div className={`${isCollapsed ? "lg:hidden" : ""} rounded-2xl bg-cw-subtle border border-cw-line p-3.5 space-y-1.5`}>
            <h4 className="text-[13px] font-semibold text-cw-ink">Solver Deterministik</h4>
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
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {/* Akun aktif. Tidak ada penggantian peran di sini: untuk berganti akun
            pengguna harus keluar lalu masuk lagi lewat /login, supaya peran
            selalu ditetapkan server. */}
        <div ref={roleDropdownRef} className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            type="button"
            title={currentUser?.name || "Pengguna"}
            aria-expanded={userDropdownOpen}
            aria-haspopup="menu"
            className={`h-12 flex items-center rounded-xl border border-cw-line bg-cw-surface hover:bg-cw-subtle text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
              isCollapsed ? "w-12 justify-center p-1" : "w-full justify-between p-2"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar
                src={currentUser?.avatarUrl}
                name={currentUser?.name || "Pengguna"}
                size="md"
                shape="rounded"
              />
              <div className={`${isCollapsed ? "lg:hidden" : ""} truncate`}>
                <p className="text-xs font-semibold text-cw-ink truncate">
                  {currentUser?.name || "Memuat..."}
                </p>
                <p className="text-[11px] text-cw-faint truncate">{ROLE_LABEL[role]}</p>
              </div>
            </div>
            <ChevronDown
              className={`${isCollapsed ? "lg:hidden" : ""} w-4 h-4 text-cw-faint flex-shrink-0`}
              strokeWidth={1.75}
            />
          </button>

          {userDropdownOpen && (
            <div
              role="menu"
              className={`absolute bottom-full left-0 mb-2 w-full bg-cw-surface rounded-2xl shadow-modal border border-cw-line py-2 z-50 lg:fixed lg:bottom-4 lg:mb-0 lg:w-64 ${
                isCollapsed ? "lg:left-[72px]" : "lg:left-[272px]"
              }`}
            >
              <div className="px-3 py-2 border-b border-cw-line flex items-center gap-2.5">
                <UserAvatar
                  src={currentUser?.avatarUrl}
                  name={currentUser?.name || "Pengguna"}
                  size="lg"
                  shape="circle"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-cw-faint">Akun aktif</p>
                  <p className="text-xs font-semibold text-cw-ink truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-cw-faint truncate">{currentUser?.email}</p>
                </div>
              </div>

              <div className="px-3 py-2 border-b border-cw-line">
                <p className="text-[11px] font-medium text-cw-faint mb-1">
                  Yang bisa kamu lakukan
                </p>
                <p className="text-[11px] text-cw-muted leading-relaxed">
                  {role === "STUDENT"
                    ? "Melihat peta beban, membuka detail pekan, bertanya, dan menanggapi bantuan. Menggeser tanggal dan mengimpor jadwal hanya untuk dosen."
                    : role === "LECTURER"
                    ? "Semua akses mahasiswa, ditambah analitik, impor CSV, dan menerapkan pergeseran tanggal."
                    : "Semua akses dosen, ditambah mengatur ulang data demo."}
                </p>
              </div>

              <button
                onClick={handleSwitchAccount}
                type="button"
                role="menuitem"
                className="w-full text-left px-3 py-2 text-xs text-cw-ink hover:bg-cw-subtle flex items-center gap-2"
              >
                <Repeat className="w-3.5 h-3.5 text-cw-faint" strokeWidth={1.75} />
                <span>Ganti akun</span>
              </button>

              <button
                onClick={handleSwitchAccount}
                type="button"
                role="menuitem"
                className="w-full text-left px-3 py-2 text-xs text-semantic-danger-fg hover:bg-cw-subtle flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block flex-shrink-0">{content}</div>

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
