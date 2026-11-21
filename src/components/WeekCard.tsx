"use client";

import React from "react";
import Link from "next/link";
import { PastelIllustration, PALETTE_LIST, IllustrationType } from "./PastelIllustrations";
import { MetricRing } from "./ui/MetricRing";
import { Tag } from "./ui/Tag";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export interface WeekMetricItem {
  id: string;
  weekNumber: number;
  loadIndex: number;
  collisionCount: number;
  isFlagged: boolean;
  totalAssignments: number;
  majorAssignmentsCount: number;
  courses: string[];
}

interface WeekCardProps {
  item: WeekMetricItem;
  maxLoad?: number;
  onSolve?: (weekNumber: number) => void;
}

export function WeekCard({ item, maxLoad = 20 }: WeekCardProps) {
  const isCollision = item.collisionCount >= 3;
  const isCaution = item.collisionCount === 2;

  const illustrationTypes: IllustrationType[] = ["laptop", "notebook", "analytics", "document"];
  const illType = illustrationTypes[item.weekNumber % illustrationTypes.length];
  const palette = PALETTE_LIST[item.weekNumber % PALETTE_LIST.length];

  const weekTitle =
    item.weekNumber === 8
      ? "Ujian Tengah Semester & Tenggat Proyek Besar"
      : item.weekNumber === 14
      ? "Tenggat Proyek Akhir Semester"
      : item.weekNumber === 16
      ? "Ujian Akhir Semester"
      : `Jadwal Akademik Pekan ${item.weekNumber}`;

  const tone = isCollision ? "danger" : isCaution ? "warning" : "success";

  return (
    <Link
      href={`/weeks/${item.weekNumber}`}
      className="cw-card group overflow-hidden flex flex-col justify-between block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
    >
      <div>
        {/* Banner Ilustrasi 112px */}
        <div className="h-28 w-full relative overflow-hidden rounded-t-2xl">
          <PastelIllustration type={illType} palette={palette} />

          {/* Badge Pekan kiri atas */}
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-cw-ink/80 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
              Pekan {item.weekNumber}
            </span>
          </div>

          {/* Badge Kritis / Waspada kanan atas (hanya jika ada masalah) */}
          {isCollision ? (
            <div className="absolute top-2.5 right-2.5">
              <Badge variant="danger" shape="pill">
                Kritis
              </Badge>
            </div>
          ) : isCaution ? (
            <div className="absolute top-2.5 right-2.5">
              <Badge variant="warning" shape="pill">
                Waspada
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Badan Kartu */}
        <div className="p-4 space-y-3.5">
          {/* Judul Tugas / Pekan */}
          <h3 className="text-[15px] font-semibold text-cw-ink leading-snug line-clamp-2 group-hover:text-cw-accent transition-colors">
            {weekTitle}
          </h3>

          {/* 2 Metric Rings: Beban & Tabrakan */}
          <div className="grid grid-cols-2 gap-2 py-1">
            <MetricRing
              value={item.loadIndex}
              max={maxLoad}
              label="Beban"
              unit="poin"
              tone={tone}
            />
            <MetricRing
              value={item.collisionCount}
              max={5}
              label="Tabrakan"
              tone={tone}
            />
          </div>

          {/* Tag Matkul */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.courses.slice(0, 3).map((code) => (
              <Tag key={code}>{code}</Tag>
            ))}
            {item.courses.length > 3 && (
              <Tag>+{item.courses.length - 3}</Tag>
            )}
          </div>
        </div>
      </div>

      {/* Satu Hairline Pemisah Sebelum Footer */}
      <div className="p-3.5 px-4 cw-hairline flex items-center justify-between text-xs">
        <span className="text-cw-faint text-xs truncate max-w-[140px]">
          {item.totalAssignments} tugas jatuh tempo
        </span>

        {isCollision ? (
          <Button
            variant="primary"
            size="sm"
            type="button"
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/weeks/${item.weekNumber}`;
            }}
          >
            Seimbangkan
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/weeks/${item.weekNumber}`;
            }}
          >
            Lihat
          </Button>
        )}
      </div>
    </Link>
  );
}
