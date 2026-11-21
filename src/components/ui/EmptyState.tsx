import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`py-12 px-4 text-center rounded-2xl bg-cw-surface border border-dashed border-cw-line flex flex-col items-center justify-center space-y-2.5 ${className}`}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-cw-sunken flex items-center justify-center text-cw-faint mb-1">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-[13px] font-semibold text-cw-ink">{title}</h3>
      <p className="text-xs text-cw-muted max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
