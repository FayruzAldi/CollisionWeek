import React from "react";

export type IllustrationType = "laptop" | "document" | "notebook" | "analytics";
export type PastelPaletteName = "biru" | "ungu" | "pasir" | "koral" | "mint";

interface IllustrationProps {
  type?: IllustrationType;
  palette?: PastelPaletteName;
  className?: string;
}

const PALETTES: Record<PastelPaletteName, { from: string; to: string; shape1: string; shape2: string }> = {
  biru: { from: "#EAF4FB", to: "#DCEBF8", shape1: "#8ECBED", shape2: "#5FA8D3" },
  ungu: { from: "#F0EDFD", to: "#E7E2FB", shape1: "#B8A2F3", shape2: "#8F76E0" },
  pasir: { from: "#FBF2E3", to: "#F7E9D2", shape1: "#EECF96", shape2: "#D9A85F" },
  koral: { from: "#FDEDE7", to: "#FBE2D8", shape1: "#F2A68C", shape2: "#E07A5F" },
  mint: { from: "#E9F6F1", to: "#DDF0E9", shape1: "#8FD3B8", shape2: "#5FB79A" },
};

export const PALETTE_LIST: PastelPaletteName[] = ["biru", "ungu", "pasir", "koral", "mint"];

export function PastelIllustration({
  type = "laptop",
  palette = "biru",
  className = "w-full h-full",
}: IllustrationProps) {
  const p = PALETTES[palette] || PALETTES.biru;

  if (type === "document") {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
      >
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="35" y="18" width="60" height="66" rx="6" fill="#FFFFFF" />
          <line x1="45" y1="32" x2="75" y2="32" stroke={p.shape2} strokeWidth="3" strokeLinecap="round" />
          <line x1="45" y1="44" x2="82" y2="44" stroke={p.shape1} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="56" x2="70" y2="56" stroke={p.shape1} strokeWidth="2" strokeLinecap="round" />
          <circle cx="112" cy="48" r="16" fill={p.shape1} />
          <path d="M106 48L110 52L119 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (type === "notebook") {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
      >
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="32" y="16" width="76" height="68" rx="8" fill="#FFFFFF" />
          <rect x="28" y="26" width="8" height="6" rx="2" fill={p.shape2} />
          <rect x="28" y="44" width="8" height="6" rx="2" fill={p.shape2} />
          <rect x="28" y="62" width="8" height="6" rx="2" fill={p.shape2} />
          <line x1="48" y1="32" x2="92" y2="32" stroke={p.shape2} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="46" x2="84" y2="46" stroke={p.shape1} strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="60" x2="76" y2="60" stroke={p.shape1} strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="52" r="13" fill={p.shape1} />
          <circle cx="120" cy="52" r="6" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  if (type === "analytics") {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
      >
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="26" y="18" width="88" height="64" rx="8" fill="#FFFFFF" />
          <rect x="40" y="52" width="12" height="20" rx="2" fill={p.shape1} />
          <rect x="58" y="40" width="12" height="32" rx="2" fill={p.shape2} />
          <rect x="76" y="28" width="12" height="44" rx="2" fill={p.shape2} />
          <path d="M38 46L56 36L74 42L98 24" stroke={p.shape1} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="98" cy="24" r="3" fill={p.shape2} />
        </svg>
      </div>
    );
  }

  // Default: laptop
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <rect x="36" y="20" width="68" height="46" rx="4" fill="#FFFFFF" />
        <rect x="42" y="26" width="56" height="34" rx="2" fill={p.from} />
        <polygon points="65,35 77,43 65,51" fill={p.shape2} />
        <path d="M24 66C24 64.8954 24.8954 64 26 64H114C115.105 64 116 64.8954 116 66V70H24V66Z" fill={p.shape1} />
        <circle cx="118" cy="30" r="10" fill={p.shape2} />
      </svg>
    </div>
  );
}
