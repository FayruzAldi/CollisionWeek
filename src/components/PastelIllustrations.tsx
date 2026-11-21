import React from "react";

interface IllustrationProps {
  type?: "laptop" | "document" | "notebook" | "analytics" | "palette" | "mobile" | "code" | "collaboration";
  className?: string;
}

export function PastelIllustration({ type = "laptop", className = "w-full h-full" }: IllustrationProps) {
  if (type === "document") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-amber-100 via-amber-50 to-orange-100 ${className}`}>
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="70" height="65" rx="6" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
          <line x1="35" y1="35" x2="75" y2="35" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <line x1="35" y1="47" x2="65" y2="47" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="35" y1="58" x2="80" y2="58" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
          <circle cx="110" cy="45" r="18" fill="#F59E0B" fillOpacity="0.8" />
          <path d="M104 45L108 49L117 41" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="85" y="60" width="45" height="25" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="95" cy="72" r="3" fill="#D97706" />
        </svg>
      </div>
    );
  }

  if (type === "notebook") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-purple-100 via-indigo-50 to-pink-100 ${className}`}>
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="15" width="80" height="70" rx="8" fill="#FFFFFF" stroke="#E9D5FF" strokeWidth="2" />
          <rect x="25" y="25" width="10" height="8" rx="2" fill="#A855F7" />
          <rect x="25" y="45" width="10" height="8" rx="2" fill="#A855F7" />
          <rect x="25" y="65" width="10" height="8" rx="2" fill="#A855F7" />
          <line x1="48" y1="32" x2="95" y2="32" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="45" x2="85" y2="45" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="57" x2="90" y2="57" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="55" r="14" fill="#EC4899" fillOpacity="0.85" />
          <circle cx="120" cy="55" r="7" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  if (type === "analytics") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-cyan-100 via-sky-50 to-blue-100 ${className}`}>
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="18" width="90" height="64" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="38" y="52" width="12" height="22" rx="2" fill="#0284C7" />
          <rect x="58" y="40" width="12" height="34" rx="2" fill="#38BDF8" />
          <rect x="78" y="30" width="12" height="44" rx="2" fill="#5850EC" />
          <path d="M35 48L55 35L75 42L100 24" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="24" r="3.5" fill="#EC4899" />
          <circle cx="125" cy="40" r="12" fill="#06B6D4" fillOpacity="0.3" />
        </svg>
      </div>
    );
  }

  if (type === "palette") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-pink-100 via-rose-50 to-purple-100 ${className}`}>
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="75" cy="50" rx="45" ry="32" fill="#FFFFFF" stroke="#FBCFE8" strokeWidth="2" />
          <circle cx="50" cy="42" r="6" fill="#F43F5E" />
          <circle cx="68" cy="34" r="6" fill="#F59E0B" />
          <circle cx="88" cy="38" r="6" fill="#10B981" />
          <circle cx="100" cy="52" r="6" fill="#3B82F6" />
          <circle cx="85" cy="64" r="8" fill="#5850EC" />
          <circle cx="55" cy="62" r="5" fill="#FCE7F3" stroke="#F43F5E" />
        </svg>
      </div>
    );
  }

  if (type === "collaboration") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-emerald-100 via-teal-50 to-sky-100 ${className}`}>
        <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="42" r="16" fill="#10B981" fillOpacity="0.8" />
          <path d="M42 75C42 65 50 60 60 60C70 60 78 65 78 75" fill="#059669" />
          <circle cx="95" cy="45" r="14" fill="#3B82F6" fillOpacity="0.8" />
          <path d="M80 75C80 67 87 62 95 62C103 62 110 67 110 75" fill="#2563EB" />
          <circle cx="120" cy="30" r="5" fill="#F59E0B" />
          <path d="M72 32L82 32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Default: laptop
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 ${className}`}>
      <svg viewBox="0 0 160 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <rect x="35" y="22" width="70" height="46" rx="4" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
        <rect x="42" y="28" width="56" height="34" rx="2" fill="#EEF2FF" />
        <polygon points="65,36 78,45 65,54" fill="#5850EC" />
        <path d="M22 68C22 66.8954 22.8954 66 24 66H116C117.105 66 118 66.8954 118 68V72H22V68Z" fill="#94A3B8" />
        <circle cx="120" cy="30" r="12" fill="#F59E0B" fillOpacity="0.8" />
        <path d="M117 30L123 30M120 27L120 33" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
