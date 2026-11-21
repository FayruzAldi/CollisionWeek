"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variantStyles = {
      primary: "bg-cw-accent hover:bg-cw-accent-hover text-white shadow-sm",
      outline:
        "bg-cw-surface border border-cw-line text-cw-ink hover:bg-cw-subtle hover:border-cw-line-strong",
      ghost: "bg-transparent text-cw-muted hover:text-cw-ink hover:bg-cw-sunken",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-[13px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
