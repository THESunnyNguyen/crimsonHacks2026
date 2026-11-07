const zone = "America/Denver";
export function today(now = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((k) => p.find((x) => x.type === k)!.value)
    .join("-");
}
export function isOpenNow(now = new Date()): boolean {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(p.find((x) => x.type === "hour")!.value);
  return (
    p.find((x) => x.type === "weekday")!.value !== "Sun" &&
    hour >= 5 &&
    hour < 17
  );
}
