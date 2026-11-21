import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "danger" | "warning" | "success" | "neutral" | "dark";
  shape?: "pill" | "rounded";
  children: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  shape = "pill",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const shapeStyles = shape === "pill" ? "rounded-full" : "rounded-md";

  const variantStyles = {
    danger: "bg-semantic-danger-soft text-semantic-danger-fg",
    warning: "bg-semantic-warning-soft text-semantic-warning-fg",
    success: "bg-semantic-success-soft text-semantic-success-fg",
    neutral: "bg-cw-sunken text-cw-muted",
    dark: "bg-cw-ink/80 text-white backdrop-blur-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${shapeStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
