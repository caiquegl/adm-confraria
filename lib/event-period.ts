/** Fixed Brazil offset used for event wall-clock times (matches backend). */
export const BRAZIL_OFFSET = "-03:00";
export const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

const TIME_RE = /^(\d{2}):(\d{2})$/;
const BR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a Brazil calendar date + HH:mm into an absolute Date.
 * Accepts DD/MM/YYYY or YYYY-MM-DD.
 */
export function parseBrazilDateTime(dateValue: string, timeValue: string): Date {
  const brDateMatch = BR_DATE_RE.exec(dateValue.trim());
  const isoDateMatch = ISO_DATE_RE.exec(dateValue.trim());
  const timeMatch = TIME_RE.exec(timeValue.trim());

  if (!timeMatch) {
    return new Date("invalid");
  }

  let isoDate: string | null = null;

  if (brDateMatch) {
    const day = Number(brDateMatch[1]);
    const month = Number(brDateMatch[2]);
    const year = Number(brDateMatch[3]);
    const probe = new Date(year, month - 1, day, 12);

    if (
      probe.getFullYear() !== year ||
      probe.getMonth() !== month - 1 ||
      probe.getDate() !== day
    ) {
      return new Date("invalid");
    }

    isoDate = `${brDateMatch[3]}-${brDateMatch[2]}-${brDateMatch[1]}`;
  } else if (isoDateMatch) {
    isoDate = dateValue.trim();
  }

  if (!isoDate) {
    return new Date("invalid");
  }

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour > 23 || minute > 59) {
    return new Date("invalid");
  }

  return new Date(`${isoDate}T${timeValue.trim()}:00${BRAZIL_OFFSET}`);
}

export function formatDayInBrazil(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
  }).format(date);
}

export function formatTimeInBrazil(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: BRAZIL_TIME_ZONE,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

/** Calendar day at local noon (legacy Event.date storage). */
export function calendarDateAtNoonFromInstant(instant: Date): Date {
  const [year, month, day] = formatDayInBrazil(instant).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatBrazilianDateFromInstant(instant: Date): string {
  const [year, month, day] = formatDayInBrazil(instant).split("-");
  return `${day}/${month}/${year}`;
}

export function isValidHhMm(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  const match = TIME_RE.exec(value.trim());
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59;
}

/** Convert HTML date input (YYYY-MM-DD) to Nest API DD/MM/YYYY. */
export function isoDateToBrazilian(isoDate: string): string {
  const [year, month, day] = isoDate.trim().split("-");
  if (!year || !month || !day) return isoDate.trim();
  return `${day}/${month}/${year}`;
}

export function formatEventPeriodLabel(input: {
  endsAt: string | Date;
  endTime?: string | null;
  startsAt: string | Date;
  startTime?: string | null;
}): string {
  const startsAt = toDate(input.startsAt);
  const endsAt = toDate(input.endsAt);
  if (!startsAt || !endsAt) return "";

  const startDay = formatDayMonthShort(startsAt);
  const endDay = formatDayMonthShort(endsAt);
  const startTime =
    normalizeTime(input.startTime) ?? formatTimeInBrazil(startsAt);
  const endTime = normalizeTime(input.endTime) ?? formatTimeInBrazil(endsAt);

  if (formatDayInBrazil(startsAt) === formatDayInBrazil(endsAt)) {
    return `${startDay} · ${startTime}–${endTime}`;
  }

  return `${startDay}, ${startTime} → ${endDay}, ${endTime}`;
}

/**
 * Resolve display/edit values from Prisma starts_at/ends_at, with date+times fallback.
 */
export function resolveEventFormPeriod(input: {
  date: Date;
  end_time: string | null;
  ends_at: Date | null;
  start_time: string | null;
  starts_at: Date | null;
}): {
  endDate: string;
  endTime: string;
  endsAt: Date;
  startDate: string;
  startTime: string;
  startsAt: Date;
} {
  const startTime =
    normalizeTime(input.start_time) ??
    (input.starts_at ? formatTimeInBrazil(input.starts_at) : "00:00");
  const endTime =
    normalizeTime(input.end_time) ??
    (input.ends_at ? formatTimeInBrazil(input.ends_at) : startTime);

  let startsAt = input.starts_at;
  let endsAt = input.ends_at;

  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    startsAt = parseBrazilDateTime(formatDayInBrazil(input.date), startTime);
  }
  if (!endsAt || Number.isNaN(endsAt.getTime())) {
    endsAt = parseBrazilDateTime(
      formatDayInBrazil(startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : input.date),
      endTime,
    );
  }

  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    startsAt = calendarDateAtNoonFromInstant(input.date);
  }
  if (!endsAt || Number.isNaN(endsAt.getTime())) {
    endsAt = startsAt;
  }

  return {
    endDate: formatDayInBrazil(endsAt),
    endTime,
    endsAt,
    startDate: formatDayInBrazil(startsAt),
    startTime,
    startsAt,
  };
}

function formatDayMonthShort(date: Date): string {
  const day = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    timeZone: BRAZIL_TIME_ZONE,
  }).format(date);

  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: BRAZIL_TIME_ZONE,
  })
    .format(date)
    .replace(/\./g, "")
    .trim()
    .toLowerCase();

  return `${day} ${month}`;
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTime(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  return TIME_RE.test(trimmed) ? trimmed : null;
}
