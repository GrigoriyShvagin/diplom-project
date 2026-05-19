const RU_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatTripDates(start: string | null, end: string | null): string {
  if (!start && !end) return "даты не указаны";
  if (start && !end) return `с ${formatRu(new Date(start))}`;
  if (!start && end) return `до ${formatRu(new Date(end))}`;
  return `${formatRu(new Date(start!))} — ${formatRu(new Date(end!))}`;
}

export function tripDayCount(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1;
}

function formatRu(d: Date): string {
  const day = d.getDate();
  const month = RU_MONTHS[d.getMonth()] ?? "";
  return `${day} ${month}`;
}
