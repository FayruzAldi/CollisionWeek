"use client";

import React from "react";
import Image from "next/image";

/**
 * Logo resmi universitas mitra.
 *
 * Sebelumnya file ini berisi SVG buatan tangan yang meniru logo UMK/BINUS/Telkom.
 * Itu salah dua kali: bentuknya tidak mirip logo aslinya, dan mengarang logo
 * institusi adalah hal yang tidak boleh dilakukan. Sekarang yang dipakai adalah
 * berkas logo resmi di /public/logos (sumber: umk.ac.id, binus.ac.id,
 * telkomuniversity.ac.id) tanpa perubahan warna atau bentuk.
 *
 * Karena ketiga logo resmi itu berlatar putih, masing-masing diletakkan di atas
 * chip putih membulat. Dengan begitu latar logo menyatu dengan chip dan tidak
 * terlihat sebagai kotak putih di panel gelap halaman masuk.
 */

type LogoSize = "sm" | "md" | "lg";

interface LogoSpec {
  src: string;
  alt: string;
  /** tinggi optis dalam px; lebar mengikuti rasio asli logo */
  height: Record<LogoSize, number>;
}

const LOGOS: Record<"umk" | "binus" | "telkom", LogoSpec> = {
  umk: {
    src: "/logos/umk.webp",
    alt: "Logo Universitas Muria Kudus",
    height: { sm: 20, md: 26, lg: 40 },
  },
  binus: {
    src: "/logos/binus.webp",
    alt: "Logo BINUS University",
    height: { sm: 18, md: 26, lg: 38 },
  },
  telkom: {
    src: "/logos/telkom.webp",
    alt: "Logo Telkom University",
    height: { sm: 20, md: 26, lg: 40 },
  },
};

function Logo({
  spec,
  size,
  className = "",
}: {
  spec: LogoSpec;
  size: LogoSize;
  className?: string;
}) {
  const h = spec.height[size];
  return (
    <Image
      src={spec.src}
      alt={spec.alt}
      height={h}
      width={h * 2}
      style={{ height: h, width: "auto" }}
      className={`object-contain ${className}`}
      unoptimized
    />
  );
}

export function UMKLogo({ size = "md" }: { size?: LogoSize }) {
  return <Logo spec={LOGOS.umk} size={size} />;
}

export function BINUSLogo({ size = "md" }: { size?: LogoSize }) {
  return <Logo spec={LOGOS.binus} size={size} />;
}

export function TelkomLogo({ size = "md" }: { size?: LogoSize }) {
  return <Logo spec={LOGOS.telkom} size={size} />;
}

/**
 * Deretan logo di atas chip putih. Dipakai di panel gelap (halaman masuk) dan
 * di halaman Tentang. `layout` vertikal untuk panel samping yang sempit,
 * horizontal untuk header dan halaman lebar.
 */
export function UniversityLogos({
  layout = "row",
  size = "md",
  variant = "chip",
  className = "",
}: {
  layout?: "row" | "column";
  size?: LogoSize;
  /**
   * "chip"  -> logo di atas kartu putih (untuk permukaan gelap, mis. panel masuk)
   * "plain" -> tanpa kartu (untuk permukaan terang, mis. header aplikasi)
   */
  variant?: "chip" | "plain";
  className?: string;
}) {
  const items = [
    { key: "umk", label: "Universitas Muria Kudus", caption: "UMK", node: <UMKLogo size={size} /> },
    { key: "binus", label: "BINUS University", caption: null, node: <BINUSLogo size={size} /> },
    { key: "telkom", label: "Telkom University", caption: "Telkom", node: <TelkomLogo size={size} /> },
  ];

  return (
    <div
      className={`flex ${layout === "column" ? "flex-col items-start" : "flex-wrap items-center"} gap-2 ${className}`}
    >
      {items.map(({ key, label, caption, node }) => (
        <span
          key={key}
          className={
            variant === "chip"
              ? `inline-flex flex-col items-center justify-center gap-1 rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${
                  size === "lg" ? "px-4 py-2.5" : size === "sm" ? "px-2 py-1" : "px-3 py-2"
                }`
              : "inline-flex items-center justify-center"
          }
          title={label}
        >
          {node}
          {caption && (
            <span
              className={`font-semibold tracking-wide text-slate-500 ${
                size === "sm" ? "text-[9px]" : "text-[10px]"
              }`}
            >
              {caption}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Mark Collision Week.
 *
 * Memakai berkas ikon yang sama dengan favicon tab browser (src/app/icon.svg),
 * sehingga ikon di tab, di header aplikasi, dan di halaman masuk adalah satu
 * identitas. Sebelumnya header memakai badge teks "CW" yang berbeda dari ikon
 * tab, jadi brand-nya tidak nyambung.
 *
 * `mood` dipertahankan demi kompatibilitas pemanggil lama, tetapi mark ini
 * tidak berubah ekspresi: logo brand tidak berganti-ganti bentuk.
 */
export function CWMascot({
  size = 36,
  className = "",
}: {
  mood?: "happy" | "neutral";
  size?: number;
  className?: string;
}) {
  // Memakai berkas ikon yang sama dengan favicon tab (/icon.svg), supaya mark
  // di header, di halaman masuk, dan di tab browser adalah satu identitas.
  // Versi sebelumnya menggambar monogram "CW" sendiri, yang berbeda dari ikon
  // tab sehingga brand terasa tidak nyambung.
  return (
    <Image
      src="/icon.svg"
      alt="Collision Week"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={className}
      unoptimized
    />
  );
}

/** Kompatibilitas: nama lama yang masih dipakai halaman Tentang. */
export function UniversityMaskots({ className = "" }: { className?: string }) {
  return <UniversityLogos layout="row" size="lg" className={className} />;
}
