import { site } from "@/content/site";
import { statusAt } from "./hours";
import { TodayStatus } from "./TodayStatus";

export function Hero() {
  return (
    <header className="space-y-4 pt-4">
      <p className="text-sm font-bold">{site.tagline}</p>
      <h1 className="font-display text-5xl leading-tight sm:text-6xl">
        {site.name}
      </h1>
      <TodayStatus initial={statusAt(new Date())} />
      <nav aria-label="Sections" className="flex flex-wrap gap-2">
        {site.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full bg-cocoa/10 px-3 py-1 text-sm font-bold"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
