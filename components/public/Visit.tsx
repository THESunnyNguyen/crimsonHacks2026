import { site } from "@/content/site";

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-6 space-y-4">
      <h2 className="font-display text-3xl sm:text-4xl">{site.visitHeading}</h2>
      <address className="space-y-1 not-italic">
        <p className="font-bold">{site.name}</p>
        <p>{site.address}</p>
      </address>
      <p>{site.hours}</p>
      <div className="flex flex-wrap gap-3">
        <a
          href={site.phoneHref}
          className="rounded-full bg-cocoa px-5 py-3 font-bold text-cream"
        >
          {site.callLabel} {site.phone}
        </a>
        <a
          href={site.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border-2 border-cocoa px-5 py-3 font-bold"
        >
          {site.directions}
        </a>
      </div>
    </section>
  );
}
