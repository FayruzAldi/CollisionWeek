"use client";

import React, { useState } from "react";
import { Rail } from "@/components/Rail";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";
import { useModals } from "@/context/ModalContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openContentModal, openSolverModal } = useModals();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-cw-bg text-cw-ink">
      {/* 1. Icon Rail (Desktop only, 64px) */}
      <Rail onOpenContentModal={openContentModal} />

      {/* 2. Sidebar (264px desktop, drawer mobile) */}
      <Sidebar
        onOpenSolverModal={openSolverModal}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 3. Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onOpenContentModal={openContentModal}
          onOpenSolverModal={openSolverModal}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
