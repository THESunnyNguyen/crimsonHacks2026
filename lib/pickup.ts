import { today } from "./time";

export function tomorrow(now = new Date()) {
  const d = new Date(`${today(now)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function pickupTimes(date: string, now = new Date()): string[] {
  if (
    ![today(now), tomorrow(now)].includes(date) ||
    new Date(`${date}T12:00:00Z`).getUTCDay() === 0
  )
    return [];
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const minutes =
    Number(parts.find((p) => p.type === "hour")!.value) * 60 +
    Number(parts.find((p) => p.type === "minute")!.value);
  return Array.from({ length: 48 }, (_, i) => 300 + i * 15)
    .filter((m) => date !== today(now) || m >= minutes + 15)
    .map(
      (m) =>
        `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
    );
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function pickupLabel(date: string, time: string) {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
  const [hour, minute] = time.split(":").map(Number);
  return `${day} · ${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}
