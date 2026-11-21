import React from "react";

export interface FieldProps {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  helperText,
  error,
  required = false,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-xs font-medium text-cw-ink">
        {label}
        {required && <span className="text-semantic-danger-fg ml-1">*</span>}
      </label>

      {children}

      {error ? (
        <p className="text-[11px] font-medium text-semantic-danger-fg">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-cw-faint">{helperText}</p>
      ) : null}
    </div>
  );
}
