"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";
import { useModals } from "@/context/ModalContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { openContentModal, openSolverModal } = useModals();

  return (
    <div className="flex min-h-[100dvh] bg-[#F8F9FB]">
      {/* Left Sidebar */}
      <Sidebar
        onOpenContentModal={openContentModal}
        onOpenSolverModal={openSolverModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onOpenContentModal={openContentModal}
          onOpenSolverModal={openSolverModal}
        />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
