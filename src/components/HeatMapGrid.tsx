"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { WeekCard, WeekMetricItem } from "./WeekCard";
import { ContentToolbar, FilterStatus, SortOption, ViewMode } from "./ContentToolbar";
import { EmptyState } from "./ui/EmptyState";
import { Button } from "./ui/Button";

interface HeatMapGridProps {
  metrics: WeekMetricItem[];
  onOpenSolverModal?: () => void;
}

export function HeatMapGrid({ metrics }: HeatMapGridProps) {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [sort, setSort] = useState<SortOption>("WEEK");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = metrics
    .filter((m) => {
      if (filter === "FLAGGED") return m.collisionCount >= 3;
      if (filter === "CAUTION") return m.collisionCount === 2;
      if (filter === "SAFE") return m.collisionCount <= 1;
      return true;
    })
    .filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        `pekan ${m.weekNumber}`.includes(q) ||
        `week ${m.weekNumber}`.includes(q) ||
        m.courses.some((c) => c.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sort === "LOAD") {
        return b.loadIndex - a.loadIndex;
      }
      return a.weekNumber - b.weekNumber;
    });

  const maxLoad = Math.max(...metrics.map((m) => m.loadIndex), 20);

  return (
    <div className="space-y-4">
      {/* Toolbar Filter & View Controls */}
      <ContentToolbar
        totalCount={metrics.length}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Baris Hitungan + Input Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <span className="text-xs text-cw-faint font-medium">
          {filtered.length} pekan ditampilkan
        </span>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-cw-faint absolute left-3 top-2.5" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Cari pekan atau matkul"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl bg-cw-surface border border-cw-line pl-8 pr-3 py-1.5 text-cw-ink placeholder-cw-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
          />
        </div>
      </div>

      {/* Grid / List Tampilan */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada pekan ditemukan"
          description="Coba ubah kata kunci pencarian atau atur ulang filter status."
          actionLabel="Atur ulang filter"
          onAction={() => {
            setFilter("ALL");
            setSearchQuery("");
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <WeekCard key={item.weekNumber} item={item} maxLoad={maxLoad} />
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="cw-card divide-y divide-cw-line overflow-hidden">
          {filtered.map((item) => {
            const isCollision = item.collisionCount >= 3;
            const isCaution = item.collisionCount === 2;

            return (
              <div
                key={item.weekNumber}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cw-subtle transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-xs ${
                      isCollision
                        ? "bg-semantic-danger-soft text-semantic-danger-fg"
                        : isCaution
                        ? "bg-semantic-warning-soft text-semantic-warning-fg"
                        : "bg-cw-sunken text-cw-muted"
                    }`}
                  >
                    P{item.weekNumber}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-cw-ink">
                      Jadwal Pekan {item.weekNumber}
                    </h4>
                    <p className="text-xs text-cw-muted mt-0.5">
                      {item.courses.join(", ") || "Tidak ada matkul"} — {item.totalAssignments} tugas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[11px] text-cw-faint block">Beban</span>
                    <span className="text-xs font-semibold text-cw-ink tabular-nums">
                      {item.loadIndex} poin
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-cw-faint block">Tabrakan</span>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isCollision
                          ? "text-semantic-danger-fg"
                          : isCaution
                          ? "text-semantic-warning-fg"
                          : "text-semantic-success-fg"
                      }`}
                    >
                      Cw = {item.collisionCount}
                    </span>
                  </div>

                  <Link href={`/weeks/${item.weekNumber}`}>
                    <Button variant={isCollision ? "primary" : "outline"} size="sm" type="button">
                      {isCollision ? "Seimbangkan" : "Lihat"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
