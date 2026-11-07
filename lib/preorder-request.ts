import { createHash } from "node:crypto";
import { z } from "zod";
import { json } from "./http";
import { consumePublicRequest } from "./store";

export function requestKey(req: Request) {
  return z.string().uuid().parse(req.headers.get("Idempotency-Key"));
}

export async function limitPublicRequest(
  req: Request,
  limit = 5,
  scope = "preorder",
) {
  const origin = req.headers.get("origin");
  // Next can reconstruct req.url with localhost behind a proxy. The original
  // Host header still matches the address used by the browser.
  const host = req.headers.get("host") ?? new URL(req.url).host;
  if (origin) {
    let sameHost = false;
    try {
      const url = new URL(origin);
      sameHost =
        ["https:", "http:"].includes(url.protocol) && url.host === host;
    } catch {}
    if (!sameHost) throw json({ error: "Please order from this website" }, 403);
  }
  // Vercel overwrites this header. Local runs use a single shared bucket.
  const ip = process.env.VERCEL
    ? (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown")
    : "local";
  const bucket = createHash("sha256").update(`${scope}:${ip}`).digest("hex");
  if (!(await consumePublicRequest(bucket, limit))) {
    throw new Response(
      JSON.stringify({ error: "Too many attempts. Try again in a minute." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
