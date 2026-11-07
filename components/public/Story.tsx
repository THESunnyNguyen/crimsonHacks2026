import Image from "next/image";
import { Fragment } from "react";
import { site } from "@/content/site";

export function Story() {
  return (
    <section id="story" className="scroll-mt-6 space-y-4">
      <h2 className="font-display text-3xl text-accent sm:text-4xl">{site.storyHeading}</h2>
      {site.storyParagraphs.map((paragraph, index) => (
        <Fragment key={paragraph}>
          <p>{paragraph}</p>
          {index === 0 ? (
            <Image
              src={site.photos.kitchen.src}
              alt={site.photos.kitchen.alt}
              width={1623}
              height={1080}
              sizes="(min-width: 768px) 720px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              className="h-auto w-full rounded-theme border border-cocoa/15"
            />
          ) : null}
        </Fragment>
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
