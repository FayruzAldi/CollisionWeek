import React from "react";

interface CircularProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function CircularProgressRing({
  value,
  size = 40,
  strokeWidth = 4,
  color = "#10B981", // Emerald default
  label,
  sublabel,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-slate-700">
          {value}%
        </span>
      </div>
      {(label || sublabel) && (
        <div className="text-left">
          {label && <p className="text-[11px] font-semibold text-slate-800 leading-tight">{label}</p>}
          {sublabel && <p className="text-[10px] text-slate-400 leading-tight">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
