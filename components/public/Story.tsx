import { site } from "@/content/site";

export function Story() {
  return (
    <section id="story" className="scroll-mt-6 space-y-4">
      <h2 className="font-display text-3xl text-accent sm:text-4xl">{site.storyHeading}</h2>
      {site.storyParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <figure className="space-y-2 rounded-theme border-l-4 border-accent bg-frosting p-4">
        <blockquote className="font-display text-2xl leading-snug">
          {site.quote.before} {site.quote.text}
        </blockquote>
        <figcaption className="text-sm">
          —{" "}
          <a
            href={site.quote.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {site.quote.credit}
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
