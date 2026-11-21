"use client";

import React, { createContext, useContext, useState } from "react";
import { CreateContentModal } from "@/components/CreateContentModal";
import { DeterministicSolverModal } from "@/components/DeterministicSolverModal";
import { HelpRequestModal } from "@/components/HelpRequestModal";

interface ModalContextType {
  openContentModal: () => void;
  openSolverModal: () => void;
  openHelpModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [solverModalOpen, setSolverModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState<any[]>([]);

  // Fetch sample assignments for quick help request
  React.useEffect(() => {
    fetch("/api/weeks/8")
      .then((r) => r.json())
      .then((d) => {
        if (d.assignments) setAssignmentOptions(d.assignments);
      })
      .catch(() => {});
  }, []);

  return (
    <ModalContext.Provider
      value={{
        openContentModal: () => setContentModalOpen(true),
        openSolverModal: () => setSolverModalOpen(true),
        openHelpModal: () => setHelpModalOpen(true),
      }}
    >
      {children}

      <CreateContentModal
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        onOpenHelpModal={() => setHelpModalOpen(true)}
        onOpenSolverModal={() => setSolverModalOpen(true)}
      />

      <DeterministicSolverModal
        isOpen={solverModalOpen}
        onClose={() => setSolverModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      <HelpRequestModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
        assignments={assignmentOptions}
      />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
