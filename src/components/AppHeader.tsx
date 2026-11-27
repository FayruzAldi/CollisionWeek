"use client";

import React from "react";
import Link from "next/link";
import { Plus, Upload, Menu, LogOut, LogIn } from "lucide-react";
import { Button } from "./ui/Button";
import { UserAvatar } from "./ui/UserAvatar";
import { useRole } from "@/context/RoleContext";
import { CWMascot, UniversityLogos } from "./UniversityAssets";

interface AppHeaderProps {
  onOpenContentModal: () => void;
  onOpenSolverModal: () => void;
  onToggleMobileMenu?: () => void;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Admin", cls: "bg-purple-100 text-purple-700" },
  LECTURER: { label: "Dosen", cls: "bg-blue-100 text-blue-700" },
  STUDENT: { label: "Mahasiswa", cls: "bg-emerald-100 text-emerald-700" },
};

export function AppHeader({
  onOpenContentModal,
  onToggleMobileMenu,
}: AppHeaderProps) {
  const { currentUser, role, can } = useRole();
  const badge = ROLE_BADGE[role] || ROLE_BADGE.STUDENT;

  // Mood maskot berdasarkan role
  const mascotMood =
    role === "ADMIN" ? "happy" : role === "LECTURER" ? "neutral" : "neutral";

  return (
    <header className="sticky top-0 z-20 bg-cw-surface/95 backdrop-blur-sm border-b border-cw-line">
      {/* Main header row: 64px */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileMenu}
            type="button"
            aria-label="Buka menu navigasi"
            className="lg:hidden p-2 rounded-xl text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {/* Brand + mascot */}
          <div className="flex items-center gap-2.5">
            <CWMascot mood={mascotMood} size={36} className="flex-shrink-0" />
            <div>
              <h1 className="text-[15px] font-semibold text-cw-ink leading-tight">
                Collision Week
              </h1>
              <p className="text-xs text-cw-faint leading-tight hidden sm:block">
                {currentUser?.program?.name
                  ? `${currentUser.program.name} · UMK`
                  : "Universitas Muria Kudus"}
              </p>
            </div>
          </div>
        </div>

        {/* Center: university logos (hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <UniversityLogos layout="row" size="sm" variant="plain" />
        </div>

        {/* Right: actions + user badge */}
        <div className="flex items-center gap-2.5">
          {/* Current user role badge (desktop) */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cw-line">
              <UserAvatar
                src={currentUser.avatarUrl}
                name={currentUser.name}
                size="xs"
                shape="circle"
              />
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge.cls}`}>
                {badge.label}
              </span>
              <span className="text-xs text-cw-muted truncate max-w-[100px]">
                {currentUser.name.split(" ")[0]}
              </span>
            </div>
          )}

          {can("schedule.import") && (
            <Link href="/import">
              <Button variant="outline" size="sm" type="button">
                <Upload className="w-4 h-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Unggah CSV</span>
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenContentModal}
            type="button"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="hidden xs:inline">Buat Baru</span>
          </Button>

          {/* Login/logout button */}
          <Link href="/login">
            <button
              type="button"
              title="Ganti akun"
              className="p-2 rounded-xl text-cw-muted hover:text-cw-ink hover:bg-cw-sunken transition-colors"
              aria-label="Login / Ganti akun"
            >
              {currentUser ? (
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <LogIn className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
