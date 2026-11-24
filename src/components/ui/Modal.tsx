"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-[680px]",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusable.length === 0) {
          event.preventDefault();
          modalRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      modalRef.current
        ?.querySelector<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
        )
        ?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cw-ink/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-cw-surface rounded-3xl shadow-modal border border-cw-line p-6 relative animate-scale-in max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup dialog"
          className="absolute top-5 right-5 p-1.5 rounded-xl text-cw-faint hover:text-cw-ink hover:bg-cw-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && (
              <h2 id="modal-title" className="text-base font-semibold text-cw-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-cw-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
