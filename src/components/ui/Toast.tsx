"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-semantic-success-fg flex-shrink-0" strokeWidth={1.75} />,
            error: <AlertCircle className="w-4 h-4 text-semantic-danger-fg flex-shrink-0" strokeWidth={1.75} />,
            info: <Info className="w-4 h-4 text-cw-accent flex-shrink-0" strokeWidth={1.75} />,
          };

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-cw-surface border border-cw-line shadow-card-hover animate-scale-in text-xs text-cw-ink"
            >
              <div className="flex items-center gap-2.5">
                {icons[toast.type]}
                <span className="leading-snug">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="p-1 rounded-lg text-cw-faint hover:text-cw-ink hover:bg-cw-sunken"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log(msg),
    };
  }
  return context;
}
