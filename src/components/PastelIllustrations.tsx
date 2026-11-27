import React from "react";
import Image from "next/image";

export type IllustrationType = "laptop" | "document" | "notebook" | "analytics";
export type PastelPaletteName = "biru" | "ungu" | "pasir" | "koral" | "mint";
export type MascotCampus = "binus" | "telkom" | "umk";

interface IllustrationProps {
  type?: IllustrationType;
  palette?: PastelPaletteName;
  campus?: MascotCampus;
  pose?: string;
  imageSrc?: string;
  showMascot?: boolean;
  className?: string;
}

const PALETTES: Record<
  PastelPaletteName,
  { from: string; to: string; shape1: string; shape2: string; glow: string }
> = {
  biru: {
    from: "#DCEBF8",
    to: "#C7E0F4",
    shape1: "#7DD3FC",
    shape2: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.16)",
  },
  ungu: {
    from: "#E6E2FA",
    to: "#D8D2F6",
    shape1: "#A5B4FC",
    shape2: "#5850EC",
    glow: "rgba(88, 80, 236, 0.16)",
  },
  pasir: {
    from: "#F6E5C8",
    to: "#EED5AB",
    shape1: "#FBBF24",
    shape2: "#D97706",
    glow: "rgba(217, 119, 6, 0.16)",
  },
  koral: {
    from: "#F7DCD6",
    to: "#F0C8BE",
    shape1: "#FCA5A5",
    shape2: "#E11D48",
    glow: "rgba(225, 29, 72, 0.15)",
  },
  mint: {
    from: "#D3EFE4",
    to: "#BEE4D5",
    shape1: "#6EE7B7",
    shape2: "#10B981",
    glow: "rgba(16, 185, 129, 0.16)",
  },
};

const TOPIC_IMAGES = [
  "/images/topics/coding.png",
  "/images/topics/database-sql.png",
  "/images/topics/uiux-web.png",
  "/images/topics/statistics-math.png",
  "/images/topics/network-db.png",
  "/images/topics/study-research.png",
  "/images/topics/engineering-lab.png",
  "/images/topics/industrial-ops.png",
  "/images/topics/management-team.png",
  "/images/topics/finance-accounting.png",
];

/**
 * Memilih ilustrasi editorial flat-isometrik bergaya Trenning yang tepat untuk tiap
 * jurusan & mata kuliah. Pencocokan menggunakan batas kata (\b) pada kode matkul
 * lebih dulu agar tidak pernah tertukar oleh substring (mis. "komputer" != "te").
 */
export function getTopicImage(hint: string, fallbackIndex = 0): string {
  const h = hint.toLowerCase();

  // 1. Pencocokan tepat berdasarkan kode mata kuliah per jurusan
  if (/\bif101\b/.test(h)) return "/images/topics/coding.png";
  if (/\bif102\b|\bsi202\b|\bak204\b/.test(h)) return "/images/topics/database-sql.png";
  if (/\bif103\b|\bif106\b|\bsi201\b/.test(h)) return "/images/topics/uiux-web.png";
  if (/\bif104\b|\bge102\b/.test(h)) return "/images/topics/statistics-math.png";
  if (/\bif105\b|\bsi203\b/.test(h)) return "/images/topics/network-db.png";
  if (/\bge101\b/.test(h)) return "/images/topics/study-research.png";
  if (/\bte2\d\d\b/.test(h)) return "/images/topics/engineering-lab.png";
  if (/\bti2\d\d\b/.test(h)) return "/images/topics/industrial-ops.png";
  if (/\bmn2\d\d\b|\bsi204\b/.test(h)) return "/images/topics/management-team.png";
  if (/\bak2\d\d\b/.test(h)) return "/images/topics/finance-accounting.png";

  // 2. Pencocokan kata kunci topik/jurusan yang aman (bukan kode 2 huruf rawan tabrakan)
  if (/\b(algoritma|pemrograman|coding|struktur data)\b/.test(h)) {
    return "/images/topics/coding.png";
  }
  if (/\b(basis data|database|sql|warehouse|etl|olap|query)\b/.test(h)) {
    return "/images/topics/database-sql.png";
  }
  if (/\b(ui|ux|web|wireframe|prototipe|srs|desain sistem|bpmn)\b/.test(h)) {
    return "/images/topics/uiux-web.png";
  }
  if (/\b(statistik|statistika|probabilitas|matematika|diskrit|induksi|regresi)\b/.test(h)) {
    return "/images/topics/statistics-math.png";
  }
  if (/\b(jaringan|network|subnet|routing|cobit|audit ti|tata kelola)\b/.test(h)) {
    return "/images/topics/network-db.png";
  }
  if (/\b(elektro|rangkaian|mikroprosesor|sinyal|fft|iot|filter|pwm)\b/.test(h)) {
    return "/images/topics/engineering-lab.png";
  }
  if (/\b(industri|rantai pasok|ergonomi|lean|kaizen|kanban|simpleks|fmea)\b/.test(h)) {
    return "/images/topics/industrial-ops.png";
  }
  if (/\b(manajemen|pemasaran|organisasi|strategi|erp|kampanye|korporat)\b/.test(h)) {
    return "/images/topics/management-team.png";
  }
  if (/\b(akuntansi|audit|pajak|perpajakan|keuangan|psak|laba rugi|arus kas)\b/.test(h)) {
    return "/images/topics/finance-accounting.png";
  }
  if (/\b(riset|literatur|esai|akademik|ujian)\b/.test(h)) {
    return "/images/topics/study-research.png";
  }

  return TOPIC_IMAGES[Math.abs(fallbackIndex) % TOPIC_IMAGES.length];
}

export const PALETTE_LIST: PastelPaletteName[] = ["biru", "ungu", "pasir", "koral", "mint"];

export function PastelIllustration({
  type = "laptop",
  palette = "biru",
  imageSrc,
  className = "w-full h-full",
}: IllustrationProps) {
  const p = PALETTES[palette] || PALETTES.biru;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt="Ilustrasi materi akademik"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <svg
          viewBox="0 0 240 120"
          fill="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="205" cy="25" r="46" fill={p.glow} />
          <circle cx="35" cy="105" r="38" fill={p.glow} />
          {type === "document" && (
            <>
              <rect x="74" y="18" width="92" height="84" rx="10" fill="#FFFFFF" />
              <line x1="90" y1="38" x2="146" y2="38" stroke={p.shape2} strokeWidth="4" strokeLinecap="round" />
              <line x1="90" y1="54" x2="152" y2="54" stroke={p.shape1} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="90" y1="70" x2="132" y2="70" stroke={p.shape1} strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}
          {type === "notebook" && (
            <>
              <rect x="70" y="18" width="100" height="84" rx="10" fill="#FFFFFF" />
              <rect x="64" y="32" width="12" height="7" rx="3" fill={p.shape2} />
              <rect x="64" y="54" width="12" height="7" rx="3" fill={p.shape2} />
              <rect x="64" y="76" width="12" height="7" rx="3" fill={p.shape2} />
              <line x1="92" y1="42" x2="150" y2="42" stroke={p.shape2} strokeWidth="4" strokeLinecap="round" />
              <line x1="92" y1="60" x2="140" y2="60" stroke={p.shape1} strokeWidth="3" strokeLinecap="round" />
            </>
          )}
          {type === "analytics" && (
            <>
              <rect x="62" y="18" width="116" height="84" rx="10" fill="#FFFFFF" />
              <rect x="82" y="60" width="14" height="24" rx="3" fill={p.shape1} />
              <rect x="106" y="44" width="14" height="40" rx="3" fill={p.shape2} />
              <rect x="130" y="32" width="14" height="52" rx="3" fill={p.shape2} />
            </>
          )}
          {type === "laptop" && (
            <>
              <rect x="68" y="20" width="104" height="62" rx="8" fill="#FFFFFF" />
              <rect x="76" y="28" width="88" height="46" rx="4" fill={p.from} />
              <polygon points="113,41 131,51 113,61" fill={p.shape2} />
              <rect x="54" y="82" width="132" height="9" rx="4.5" fill={p.shape1} />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
