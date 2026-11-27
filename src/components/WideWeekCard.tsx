"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import {
  PastelIllustration,
  PastelPaletteName,
  IllustrationType,
  getTopicImage,
} from "./PastelIllustrations";
import { Button } from "./ui/Button";

interface WideWeekCardProps {
  weekNumber: number;
  title: string;
  collisionCount: number;
  loadIndex: number;
  courses: string[];
  recommendation: string;
  palette?: PastelPaletteName;
  illustrationType?: IllustrationType;
  programQuery?: string;
}

export function WideWeekCard({
  weekNumber,
  title,
  collisionCount,
  loadIndex,
  courses,
  recommendation,
  palette = "koral",
  illustrationType = "laptop",
  programQuery = "",
}: WideWeekCardProps) {
  const isCritical = collisionCount >= 3;
  const loadPercentage = Math.min(Math.round((loadIndex / 20) * 100), 100);

  return (
    <div className="cw-card p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Banner dengan foto materi */}
        <div className="w-full sm:w-44 h-28 rounded-xl relative overflow-hidden flex-shrink-0">
          <PastelIllustration
            type={illustrationType}
            palette={palette}
            imageSrc={getTopicImage(courses.join(" "), weekNumber)}
          />
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-[11px] font-medium backdrop-blur-md">
            Pekan {weekNumber} · {courses.length} matkul
          </div>
        </div>

        {/* Konten Kanan */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cw-accent">
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>
                {isCritical
                  ? `Tabrakan ${weekNumber === 8 ? "UTS" : "pra-UAS"} (Cw = ${collisionCount})`
                  : `Pekan ${weekNumber}`}
              </span>
            </span>
            <span className="text-[11px] text-cw-faint font-medium truncate">
              {courses.join(", ")}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold text-cw-ink leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Bar Progres Beban */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cw-muted font-medium">Indeks Beban</span>
              <span className={`font-semibold tabular-nums ${isCritical ? "text-semantic-danger-fg" : "text-semantic-warning-fg"}`}>
                {loadIndex} poin {isCritical ? "· Kritis" : "· Tinggi"}
              </span>
            </div>
            <div className="w-full bg-cw-sunken h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isCritical ? "bg-semantic-danger-ring" : "bg-semantic-warning-ring"}`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-cw-faint">
              {isCritical ? "Beban mahasiswa menumpuk" : "Tenggat bertabrakan"}
            </span>
            <Link href={`/weeks/${weekNumber}${programQuery}`}>
              <Button variant="outline" size="sm" type="button">
                <span>Seimbangkan</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Strip footer rekomendasi */}
      <div className="mt-3.5 pt-3 cw-hairline flex items-center justify-between text-xs text-cw-ink bg-cw-subtle p-2.5 px-3 rounded-xl">
        <p className="text-xs text-cw-muted truncate pr-2">
          {recommendation}
        </p>
        <Link
          href={`/weeks/${weekNumber}${programQuery}`}
          className="font-semibold text-cw-accent hover:underline flex-shrink-0"
        >
          Terapkan →
        </Link>
      </div>
    </div>
  );
}
