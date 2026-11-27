"use client";

import React, { useEffect, useState } from "react";

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-6 h-6 text-[11px]",
  md: "w-7 h-7 text-xs",
  lg: "w-9 h-9 text-xs",
};

const SHAPE_CLASSES: Record<NonNullable<UserAvatarProps["shape"]>, string> = {
  circle: "rounded-full",
  rounded: "rounded-lg",
};

export function UserAvatar({
  src,
  name,
  size = "sm",
  shape = "circle",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const baseClasses = `${SIZE_CLASSES[size]} ${SHAPE_CLASSES[shape]} flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-cw-line/80`;

  if (src && !imgError) {
    return (
      <div className={`${baseClasses} bg-cw-sunken ${className}`.trim()}>
        <img
          src={src}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={name}
      className={`${baseClasses} bg-cw-accent-soft text-cw-accent font-semibold ${className}`.trim()}
    >
      {initial}
    </div>
  );
}
