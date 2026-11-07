"use client";

export type OrdersTabProps = {
  pin: string;
  onUnauthorized: () => void;
};

// Stub: lane C replaces this with the order board. Keep the props.
export function OrdersTab(_props: OrdersTabProps) {
  return (
    <section>
      <h2 className="font-display text-2xl">Orders</h2>
      <p>Phone orders and call notes. Coming from lane C.</p>
    </section>
  );
}
