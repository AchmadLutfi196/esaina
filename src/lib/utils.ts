import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date the way the Indonesian UI expects: "29 Okt 2026 14:02" */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** "29 Okt 2026" */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** "29 Okt, 14:02" */
export function formatDueDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function countWords(text: string): number {
  const trimmed = (text ?? "").trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = d.getTime() - Date.now();
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absMinutes < 60) {
    const value = absMinutes;
    return diffMs >= 0
      ? `dalam ${value} menit`
      : `${value} menit lalu`;
  }
  const hours = Math.round(absMinutes / 60);
  if (hours < 24) {
    return diffMs >= 0 ? `dalam ${hours} jam` : `${hours} jam lalu`;
  }
  const days = Math.round(hours / 24);
  return diffMs >= 0 ? `dalam ${days} hari` : `${days} hari lalu`;
}

/** Generate an 8-char alphanumeric assessment code, e.g. "FISIKA8A" */
export function generateAssessmentCode(subject: string): string {
  const prefix = subject.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "ESAI";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < Math.max(4, 9 - prefix.length); i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}${suffix}`;
}

/** Generate a class code, e.g. "BIO-XI-882" */
export function generateClassCode(subject: string, grade: string): string {
  const prefix = subject.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "KLS";
  const gradePart = grade.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "XI";
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${gradePart}-${num}`;
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
}
