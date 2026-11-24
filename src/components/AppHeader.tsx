"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Upload, Menu } from "lucide-react";
import { Button } from "./ui/Button";

interface AppHeaderProps {
  onOpenContentModal: () => void;
  onOpenSolverModal: () => void;
  onToggleMobileMenu?: () => void;
}

export function AppHeader({
  onOpenContentModal,
  onToggleMobileMenu,
}: AppHeaderProps) {
  const pathname = usePathname();

  const navTabs = [
    { href: "/", label: "Dasbor" },
    { href: "/weeks/10", label: "Pekan" },
    { href: "/help", label: "Bantuan" },
    { href: "/analytics", label: "Analitik" },
    { href: "/import", label: "Impor" },
    { href: "/about", label: "Tentang" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-cw-surface/95 backdrop-blur border-b border-cw-line">
      {/* Baris 1: Brand & Aksi Utama (64px) */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            type="button"
            aria-label="Buka menu navigasi"
            className="lg:hidden p-2 rounded-xl text-cw-muted hover:text-cw-ink hover:bg-cw-sunken"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {/* Program Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cw-accent-soft text-cw-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
              TI
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-cw-ink leading-tight">
                Collision Week
              </h1>
              <p className="text-xs text-cw-faint leading-tight">
                Teknik Informatika · ITB
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/import">
            <Button variant="outline" size="sm" type="button">
              <Upload className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Unggah CSV</span>
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenContentModal}
            type="button"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Buat Baru</span>
          </Button>
        </div>
      </div>

      {/* Baris 2: Tab Navigasi Halaman (44px) */}
      <div className="h-11 px-4 sm:px-6 flex items-center gap-6 text-[13px] border-t border-cw-line overflow-x-auto scrollbar-none">
        {navTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`h-full flex items-center border-b-2 transition-colors whitespace-nowrap flex-shrink-0 px-0.5 ${
                isActive
                  ? "border-cw-accent text-cw-ink font-semibold"
                  : "border-transparent text-cw-muted hover:text-cw-ink"
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
