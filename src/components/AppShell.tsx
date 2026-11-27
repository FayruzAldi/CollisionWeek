"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";
import { useModals } from "@/context/ModalContext";
import { useRole } from "@/context/RoleContext";
import { capabilityForPath } from "@/lib/permissions";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openContentModal, openSolverModal } = useModals();
  const { currentUser, isLoading, can } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  const requiredCapability = capabilityForPath(pathname);
  const blockedByRole =
    !isLoading && !!currentUser && !!requiredCapability && !can(requiredCapability);

  // Halaman yang boleh dibaca tanpa sesi. Middleware sudah meloloskan
  // /login dan /about, tetapi AppShell tetap mengusir pengunjung anonim ke
  // /login — akibatnya Tentang tidak pernah bisa dibuka tanpa masuk.
  const isPublicPage = pathname === "/login" || pathname === "/about";

  // Redirect to login if not logged in and not on a public page
  useEffect(() => {
    if (!isLoading && !currentUser && !isPublicPage) {
      router.replace("/login");
    }
  }, [isLoading, currentUser, isPublicPage, router]);

  // Peran tidak berhak atas rute ini: kirim ke beranda, jangan render kosong
  useEffect(() => {
    if (blockedByRole) {
      router.replace("/");
    }
  }, [blockedByRole, router]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  // Halaman publik dirender tanpa kerangka aplikasi (tanpa sidebar/header
  // yang butuh data pengguna). Ini juga harus berlaku saat sesi belum ada,
  // kalau tidak pengunjung anonim melihat skeleton "Memuat sesi..." selamanya.
  if (pathname === "/login") {
    return <>{children}</>;
  }
  if (isPublicPage && !currentUser) {
    return <>{children}</>;
  }

  // Show loading skeleton while checking auth
  if (isLoading || !currentUser) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-cw-bg">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cw-accent animate-pulse mx-auto" />
          <p className="text-xs text-cw-muted">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-cw-bg text-cw-ink">
      <Sidebar
        onOpenSolverModal={openSolverModal}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AppHeader
          onOpenContentModal={openContentModal}
          onOpenSolverModal={openSolverModal}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 pb-16 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
