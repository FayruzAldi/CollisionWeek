import React from "react";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export function Pill({ active = false, children, className = "", ...props }: PillProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
        active
          ? "bg-cw-ink text-white"
          : "bg-cw-surface border border-cw-line text-cw-muted hover:text-cw-ink hover:bg-cw-subtle"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
