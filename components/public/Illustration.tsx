// Fallback art for items and groups without a generated photo. Colors come from theme tokens only.
export type Shape =
  | "ring"
  | "filled"
  | "bar"
  | "roll"
  | "fritter"
  | "croissant"
  | "sandwich";

const art: Record<Shape, React.ReactNode> = {
  ring: (
    <>
      <circle cx="50" cy="50" r="44" className="fill-cocoa/25" />
      <circle cx="50" cy="50" r="36" className="fill-frosting" />
      <circle cx="50" cy="50" r="14" className="fill-cream" />
    </>
  ),
  filled: (
    <>
      <circle cx="50" cy="50" r="44" className="fill-cocoa/25" />
      <circle cx="50" cy="50" r="34" className="fill-frosting" />
      {[
        [38, 42],
        [56, 36],
        [62, 56],
        [44, 62],
        [30, 56],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" className="fill-cream" />
      ))}
    </>
  ),
  bar: (
    <>
      <rect x="8" y="26" width="84" height="48" rx="16" className="fill-cocoa/25" />
      <rect x="14" y="32" width="72" height="34" rx="12" className="fill-frosting" />
      <path d="M50 34 L46 64" className="stroke-cream" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  roll: (
    <>
      <circle cx="50" cy="50" r="44" className="fill-cocoa/25" />
      <circle cx="50" cy="50" r="36" className="fill-frosting/60" />
      <path
        d="M50 50 C50 40 62 40 62 50 C62 64 38 64 38 50 C38 32 70 32 70 50"
        className="fill-none stroke-cocoa/60"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </>
  ),
  fritter: (
    <>
      <path
        d="M20 40 C25 15 60 12 75 28 C92 42 88 70 70 82 C55 92 30 88 20 72 C8 60 12 50 20 40 Z"
        className="fill-cocoa/25"
      />
      <path
        d="M30 45 L45 35 L60 48 L78 40"
        className="fill-none stroke-frosting"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  croissant: (
    <>
      <path
        d="M8 62 C20 20 80 20 92 62 C84 48 70 42 60 46 C52 32 40 32 32 46 C22 42 14 48 8 62 Z"
        className="fill-cocoa/25"
      />
      <path
        d="M50 40 L50 54 M30 46 L38 56 M70 46 L62 56"
        className="stroke-cocoa/50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  sandwich: (
    <>
      <path d="M14 40 Q50 8 86 40 Z" className="fill-cocoa/25" />
      <path d="M10 46 L90 46 L86 70 L14 70 Z" className="fill-frosting" />
      <rect x="10" y="72" width="80" height="10" rx="3" className="fill-cocoa/25" />
    </>
  ),
};

export function Illustration({
  shape,
  className,
}: {
  shape: Shape;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {art[shape]}
    </svg>
  );
}
