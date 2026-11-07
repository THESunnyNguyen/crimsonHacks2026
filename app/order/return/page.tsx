import { CheckoutResult } from "@/components/public/CheckoutResult";

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <CheckoutResult
        sessionId={params.session_id ?? ""}
        cancelled={params.cancelled === "1"}
      />
    </main>
  );
}
