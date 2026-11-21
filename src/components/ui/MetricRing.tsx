import React from "react";

export interface MetricRingProps {
  value: number;
  max: number;
  label: string;
  display?: string;
  tone: "neutral" | "success" | "warning" | "danger";
  size?: number;
  unit?: string;
}

export function MetricRing({
  value,
  max,
  label,
  display,
  tone = "neutral",
  size = 32,
  unit = "",
}: MetricRingProps) {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(Math.max(value / safeMax, 0), 1);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  const toneColors = {
    danger: "#E5484D",
    warning: "#E9A23B",
    success: "#22A06B",
    neutral: "#5850EC",
  };

  const displayText = display ?? `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div
      className="flex items-center gap-2.5"
      role="img"
      aria-label={`${label}: ${displayText}`}
    >
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ECEEF3"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={toneColors[tone]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300"
          />
        </svg>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-cw-ink tabular-nums leading-none">
          {displayText}
        </span>
        <span className="text-[11px] font-medium text-cw-faint mt-0.5 leading-none truncate">
          {label}
        </span>
      </div>
    </div>
  );
}
