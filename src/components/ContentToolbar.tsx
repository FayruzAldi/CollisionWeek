"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Pill } from "./ui/Pill";
import { Select } from "./ui/Select";

export type FilterStatus = "ALL" | "FLAGGED" | "CAUTION" | "SAFE";
export type SortOption = "WEEK" | "LOAD";
export type ViewMode = "grid" | "list";

interface ContentToolbarProps {
  totalCount: number;
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ContentToolbar({
  totalCount,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ContentToolbarProps) {
  const isFiltered = filter !== "ALL";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      {/* Kiri: Pill status + Reset */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Pill active={filter === "ALL"} onClick={() => onFilterChange("ALL")}>
          Semua ({totalCount})
        </Pill>
        <Pill active={filter === "FLAGGED"} onClick={() => onFilterChange("FLAGGED")}>
          Kritis (≥3)
        </Pill>
        <Pill active={filter === "CAUTION"} onClick={() => onFilterChange("CAUTION")}>
          Waspada (2)
        </Pill>
        <Pill active={filter === "SAFE"} onClick={() => onFilterChange("SAFE")}>
          Aman (≤1)
        </Pill>

        {isFiltered && (
          <button
            onClick={() => onFilterChange("ALL")}
            type="button"
            className="text-xs text-cw-accent hover:underline font-medium ml-1"
          >
            Atur ulang
          </button>
        )}
      </div>

      {/* Kanan: Urutkan + Toggle Tampilan */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <Select<SortOption>
          value={sort}
          onChange={onSortChange}
          aria-label="Urutan tampilan"
          className="w-40"
          options={[
            { value: "WEEK", label: "Urutkan: Pekan" },
            { value: "LOAD", label: "Urutkan: Beban" },
          ]}
        />

        <div className="flex items-center bg-cw-surface border border-cw-line rounded-xl p-0.5" role="group" aria-label="Mode tampilan">
          <button
            onClick={() => onViewModeChange("grid")}
            type="button"
            aria-label="Tampilan petak"
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
              viewMode === "grid"
                ? "bg-cw-sunken text-cw-ink"
                : "text-cw-faint hover:text-cw-ink"
            }`}
          >
            <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            type="button"
            aria-label="Tampilan daftar"
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 ${
              viewMode === "list"
                ? "bg-cw-sunken text-cw-ink"
                : "text-cw-faint hover:text-cw-ink"
            }`}
          >
            <List className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
