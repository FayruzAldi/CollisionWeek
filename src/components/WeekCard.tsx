"use client";

import React from "react";
import Link from "next/link";
import { Calendar, User, BookOpen, ChevronRight, FileText } from "lucide-react";
import {
  PastelIllustration,
  PALETTE_LIST,
  IllustrationType,
  getTopicImage,
} from "./PastelIllustrations";
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
  // Extended detail fields (populated from heatmap API)
  lecturerNames?: string[];
  dueDateRange?: { earliest: string; latest: string };
  weekDateRange?: { start: string; end: string };
}

interface WeekCardProps {
  item: WeekMetricItem;
  maxLoad?: number;
  onSolve?: (weekNumber: number) => void;
  programQuery?: string;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export function WeekCard({ item, maxLoad = 20, programQuery = "" }: WeekCardProps) {
  const isCollision = item.collisionCount >= 3;
  const isCaution = item.collisionCount === 2;

  const illustrationTypes: IllustrationType[] = ["laptop", "notebook", "analytics", "document"];
  const illType = illustrationTypes[item.weekNumber % illustrationTypes.length];
  const palette = isCollision
    ? "koral"
    : isCaution
    ? "pasir"
    : PALETTE_LIST[item.weekNumber % PALETTE_LIST.length];

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
      href={`/weeks/${item.weekNumber}${programQuery}`}
      className="cw-card group overflow-hidden flex flex-col justify-between block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
    >
      <div>
        {/* Banner Ilustrasi gaya Trenning (inset rounded-xl + frosted pill) */}
        <div className="p-2.5 pb-0">
          <div className="h-28 w-full relative overflow-hidden rounded-xl">
            <PastelIllustration
              type={illType}
              palette={palette}
              imageSrc={getTopicImage(item.courses.join(" "), item.weekNumber)}
            />

            {/* Frosted badge kiri atas (gaya 21 Assigned Trenning) */}
            <div className="absolute top-2.5 left-2.5">
              <span className="bg-slate-900/75 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md inline-flex items-center gap-1.5 shadow-sm">
                <span>Pekan {item.weekNumber} · {item.totalAssignments} Tugas</span>
                <FileText className="w-3 h-3 opacity-85" strokeWidth={1.75} />
              </span>
            </div>

            {/* Badge Kritis kanan atas */}
            {isCollision ? (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="danger" shape="pill">Kritis</Badge>
              </div>
            ) : isCaution ? (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="warning" shape="pill">Waspada</Badge>
              </div>
            ) : null}

            {/* Week date range */}
            {item.weekDateRange && (
              <div className="absolute bottom-2.5 left-2.5">
                <span className="bg-slate-900/65 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatShortDate(item.weekDateRange.start)} - {formatShortDate(item.weekDateRange.end)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badan Kartu */}
        <div className="p-3.5 space-y-3">
          {/* Judul */}
          <h3 className="text-[13px] font-semibold text-cw-ink leading-snug line-clamp-2 group-hover:text-cw-accent transition-colors">
            {weekTitle}
          </h3>

          {/* 2 Metric Rings: Beban & Tabrakan */}
          <div className="grid grid-cols-2 gap-2">
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

          {/* Detail info: matkul, dosen, tanggal */}
          <div className="space-y-1.5 pt-0.5">
            {/* Matkul */}
            <div className="flex items-start gap-1.5">
              <BookOpen className="w-3 h-3 text-cw-faint flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex flex-wrap gap-1">
                {item.courses.slice(0, 3).map((code) => (
                  <Tag key={code}>{code}</Tag>
                ))}
                {item.courses.length > 3 && (
                  <Tag>+{item.courses.length - 3}</Tag>
                )}
                {item.courses.length === 0 && (
                  <span className="text-[11px] text-cw-faint">Tidak ada matkul</span>
                )}
              </div>
            </div>

            {/* Dosen (jika tersedia) */}
            {item.lecturerNames && item.lecturerNames.length > 0 && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-cw-faint flex-shrink-0" strokeWidth={1.75} />
                <span className="text-[11px] text-cw-muted truncate">
                  {item.lecturerNames.slice(0, 2).join(", ")}
                  {item.lecturerNames.length > 2 && ` +${item.lecturerNames.length - 2}`}
                </span>
              </div>
            )}

            {/* Rentang tenggat */}
            {item.dueDateRange && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-cw-faint flex-shrink-0" strokeWidth={1.75} />
                <span className="text-[11px] text-cw-muted">
                  Tenggat: {formatShortDate(item.dueDateRange.earliest)}
                  {item.dueDateRange.earliest !== item.dueDateRange.latest &&
                    ` s.d. ${formatShortDate(item.dueDateRange.latest)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer dengan hairline */}
      <div className="p-3.5 px-4 cw-hairline flex items-center justify-between text-xs">
        <span className="text-cw-faint text-xs truncate max-w-[140px]">
          {item.totalAssignments} tugas · {item.majorAssignmentsCount} tugas besar
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
          <span className="flex items-center gap-1 text-cw-accent text-xs font-medium group-hover:gap-2 transition-all">
            Lihat <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </Link>
  );
}
