"use client";

export type CaseTabProps = {
  pin: string;
  onUnauthorized: () => void;
};

// Stub: lane A replaces this with snap → count → confirm. Keep the props.
export function CaseTab(_props: CaseTabProps) {
  return (
    <section>
      <h2 className="font-display text-2xl">Case</h2>
      <p>Snap the case to update live stock. Coming from lane A.</p>
    </section>
  );
}
