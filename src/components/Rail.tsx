"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Upload,
  Info,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface RailProps {
  onOpenContentModal: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Rail({
  onOpenContentModal,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: RailProps) {
  const pathname = usePathname();
  const { currentUser } = useRole();

  const navItems = [
    { href: "/", label: "Dasbor", icon: LayoutDashboard },
    { href: "/weeks/8", label: "Pekan", icon: CalendarDays },
    { href: "/help", label: "Bantuan Sebaya", icon: Users },
    { href: "/analytics", label: "Analitik", icon: BarChart3 },
    { href: "/import", label: "Impor", icon: Upload },
  ];

  return (
    <aside
      className="hidden lg:flex w-16 bg-cw-surface border-r border-cw-line sticky top-0 h-dvh flex-col justify-between items-center py-4 z-30 flex-shrink-0"
      aria-label="Navigasi Utama"
    >
      {/* Top: Logo & Nav items */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Logo */}
        <Link
          href="/"
          className="w-8 h-8 rounded-xl bg-cw-accent text-white flex items-center justify-center font-semibold text-xs shadow-sm hover:bg-cw-accent-hover transition-colors"
          title="Collision Week"
          aria-label="Beranda Collision Week"
        >
          cw
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
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
                title={item.label}
                aria-label={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
                  isActive
                    ? "bg-cw-sunken text-cw-ink font-semibold"
                    : "text-cw-faint hover:text-cw-ink hover:bg-cw-subtle"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Action +, About, Avatar */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            type="button"
            title={isSidebarCollapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
            aria-label={isSidebarCollapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
            className="w-9 h-9 rounded-xl text-cw-faint hover:text-cw-ink hover:bg-cw-sunken flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="w-5 h-5" strokeWidth={1.75} />
            )}
          </button>
        )}

        {/* Tombol Buat Baru (+) */}
        <button
          onClick={onOpenContentModal}
          type="button"
          title="Buat baru"
          aria-label="Buat baru"
          className="w-9 h-9 rounded-xl bg-cw-accent hover:bg-cw-accent-hover text-white flex items-center justify-center shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Tentang */}
        <Link
          href="/about"
          title="Tentang"
          aria-label="Tentang"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
            pathname.startsWith("/about")
              ? "bg-cw-sunken text-cw-ink font-semibold"
              : "text-cw-faint hover:text-cw-ink hover:bg-cw-subtle"
          }`}
        >
          <Info className="w-5 h-5" strokeWidth={1.75} />
        </Link>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-cw-accent-soft text-cw-accent text-xs font-semibold flex items-center justify-center overflow-hidden border border-cw-line"
          title={currentUser?.name || "Pengguna"}
          aria-label={`Profil ${currentUser?.name || "Pengguna"}`}
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            currentUser?.name?.charAt(0) || "U"
          )}
        </div>
      </div>
    </aside>
  );
}
