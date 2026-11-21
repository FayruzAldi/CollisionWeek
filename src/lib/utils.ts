import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInHours } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return format(new Date(date), "MMM d, yyyy HH:mm");
  } catch {
    return String(date);
  }
}

export function isMoreThan12HoursOld(date: string | Date): boolean {
  try {
    const hours = differenceInHours(new Date(), new Date(date));
    return hours >= 12;
  } catch {
    return false;
  }
}

export function parseSubtopics(subtopicsField: string | string[]): string[] {
  if (Array.isArray(subtopicsField)) return subtopicsField;
  if (!subtopicsField) return [];
  try {
    const parsed = JSON.parse(subtopicsField);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fallback: comma-separated
    return subtopicsField
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
