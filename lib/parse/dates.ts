import { today } from "../time";

// Add calendar days to Denver's date, never 24 hours to an instant (DST).
export function nextDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
export function denverContext(now = new Date()) {
  const date = today(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Denver", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
  return { date, tomorrow: nextDate(date), time };
}
