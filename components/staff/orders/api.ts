export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Staff requests carry the PIN header. A 401 means the PIN was revoked or
// changed, so callers should lock the app rather than show a generic error.
export async function staffFetch<T>(
  pin: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-staff-pin", pin);
  if (typeof init.body === "string")
    headers.set("Content-Type", "application/json");
  const res = await fetch(path, { ...init, headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError(
      res.status,
      typeof data.error === "string" ? data.error : "Request failed",
    );
  return data as T;
}
