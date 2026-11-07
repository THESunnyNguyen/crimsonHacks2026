import { ZodError } from "zod";
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function handle(
  action: () => Promise<Response>,
): Promise<Response> {
  try {
    return await action();
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof ZodError)
      return json({ error: e.issues.map((i) => i.message).join("; ") }, 400);
    if (e instanceof SyntaxError) return json({ error: "Invalid JSON" }, 400);
    console.error(
      "Request failed:",
      e instanceof Error ? e.message : "Unknown error",
    );
    return json({ error: "Unable to complete request" }, 500);
  }
}
