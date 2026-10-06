import type { BusinessSettings } from "@/types";

/** Hora actual en Perú (America/Lima) en formato "HH:mm". */
export function nowInLima(): string {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  }).format(new Date());
}

/** ¿Caleb está atendiendo ahora? Soporta horarios que cruzan medianoche. */
export function isOpenNow(settings: BusinessSettings): boolean {
  if (!settings.is_open) return false;
  const now = nowInLima();
  const { open_time, close_time } = settings;
  if (open_time <= close_time) {
    return now >= open_time && now < close_time;
  }
  // cruza medianoche, ej. 17:30–02:00
  return now >= open_time || now < close_time;
}

export function formatSoles(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

/** Clave de fecha en hora Perú: "YYYY-MM-DD" (sirve para comparar "el mismo día"). */
export function limaDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** true si la fecha (ISO) cae hoy según el calendario de Perú. */
export function isTodayInLima(iso: string): boolean {
  return limaDateKey(iso) === limaDateKey(new Date());
}

/** Clave de mes en hora Perú: "YYYY-MM". */
export function limaMonthKey(date: Date | string): string {
  return limaDateKey(date).slice(0, 7);
}

/** Inicio del día de hoy en Perú (00:00 America/Lima) como ISO UTC para consultas SQL. */
export function startOfTodayLimaISO(): string {
  // Perú no usa horario de verano: siempre UTC-5
  return `${limaDateKey(new Date())}T00:00:00-05:00`;
}
