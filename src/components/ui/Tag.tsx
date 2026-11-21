import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Tag({ children, className = "", ...props }: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md bg-cw-sunken text-cw-muted text-[11px] font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
