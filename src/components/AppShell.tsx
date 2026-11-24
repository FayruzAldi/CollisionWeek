"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";
import { useModals } from "@/context/ModalContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openContentModal, openSolverModal } = useModals();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsSidebarCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-[100dvh] bg-cw-bg text-cw-ink">
      <Sidebar
        onOpenSolverModal={openSolverModal}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />

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
