export const SCHOOL_TIMEZONE = "Africa/Kampala";
export const KAMPALA_OFFSET = "+03:00";

function partsMap(date: Date, options: Intl.DateTimeFormatOptions) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SCHOOL_TIMEZONE,
    ...options,
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

export function formatSchoolDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SCHOOL_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatSchoolDateTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${new Intl.DateTimeFormat("en-GB", {
    timeZone: SCHOOL_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} EAT`;
}

export function toDatetimeLocalValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const map = partsMap(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const month = map.month?.padStart(2, "0");
  const day = map.day?.padStart(2, "0");
  const hour = (map.hour || "00").padStart(2, "0");
  const minute = (map.minute || "00").padStart(2, "0");
  return `${map.year}-${month}-${day}T${hour}:${minute}`;
}

export function dateFromKampalaLocal(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = trimmed.length === 16 ? `${trimmed}:00${KAMPALA_OFFSET}` : `${trimmed}${KAMPALA_OFFSET}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function kampalaYearMonth(date = new Date()) {
  const map = partsMap(date, { year: "numeric", month: "2-digit" });
  return { year: Number(map.year), month: Number(map.month) };
}

export function kampalaDayStamp(date: Date) {
  const map = partsMap(date, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${map.year}-${map.month.padStart(2, "0")}-${map.day.padStart(2, "0")}`;
}
