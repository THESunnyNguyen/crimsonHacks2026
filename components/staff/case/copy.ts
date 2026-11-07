// Staff-facing copy for the Case tab.
export const caseCopy = {
  heading: "Case",
  intro: "Snap the case. The AI counts, you check, then publish.",
  snap: "📷 Snap the case",
  snapAgain: "📷 Snap again",
  counting: "Counting donuts…",
  cancel: "Cancel",
  countedIn: (s: string) => `Counted in ${s}s`,
  reviewHeading: "Check the counts",
  photoAlt: "The photo you just took",
  lowConfidence: "Check this one",
  disagree: "Two models disagree. Check this one.",
  secondSays: (model: string, n: number) => `${model} counted ${n}`,
  held: (n: number) => `${n} held for orders`,
  total: (n: number) => `Total ${n}`,
  allZero: "All zero: the site will say Sold out for today.",
  publish: "Confirm & publish",
  publishing: "Publishing…",
  discard: "Discard photo",
  published: "Live on the site.",
  publishFailed: "Couldn't publish. Check the connection and try again.",
  countFailed: "Couldn't count that photo.",
  useManual: "Set the counts by hand below. It still works without the AI.",
  tryAgain: "Try another photo",
  timeout: "Counting took too long. Try again, or set the counts by hand.",
  offline: "No connection. Set the counts by hand when you're back online.",
  manualHeading: "Adjust by hand",
  manualIntro: "No photo needed. Change a number, then publish.",
  manualPublish: "Publish counts",
  manualReset: "Reset",
  manualUnchanged: "Matches the site",
  live: "Live on the site now",
  loading: "Loading stock…",
  loadFailed: "Couldn't load current stock.",
  updated: (when: string, source: string) => `Updated ${when} · ${source}`,
  soldOutHeading: "Sold out for today",
  soldOutOn: "The site shows the Sold out banner.",
  soldOutOff: "Turn on when the case is empty for the day.",
  soldOutToastOn: "Site now says Sold out for today.",
  soldOutToastOff: "Sold-out banner is off.",
  less: (name: string) => `One less ${name}`,
  more: (name: string) => `One more ${name}`,
  countLabel: (name: string) => `${name} count`,
};

export const sourceNames = {
  photo: "photo",
  manual: "by hand",
  casecam: "camera",
} as const;

export function ago(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
