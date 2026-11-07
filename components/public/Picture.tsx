import Image from "next/image";
import { site } from "@/content/site";
import { Illustration, type Shape } from "./Illustration";

// A square photo with the "Illustration" label, or the SVG fallback when there is no photo.
export function Picture({
  src,
  alt,
  shape,
}: {
  src?: string;
  alt: string;
  shape: Shape;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-theme bg-cocoa/5">
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2 py-0.5 text-xs font-bold text-cocoa">
            {site.illustrationLabel}
          </span>
        </>
      ) : (
        <Illustration shape={shape} className="h-full w-full p-6" />
      )}
    </div>
  );
}
