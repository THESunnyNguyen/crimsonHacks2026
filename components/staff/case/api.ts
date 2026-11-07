// Client calls for the Case tab. A 401 anywhere means the PIN is stale.
import type { CountResult, Inventory, StockGroupId } from "@/lib/types";

export class Unauthorized extends Error {}
export class ApiError extends Error {}

async function read<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Unauthorized();
  const body = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      body && typeof body.error === "string"
        ? body.error
        : `Request failed (${res.status})`,
    );
  return body as T;
}

export async function fetchInventory(signal?: AbortSignal): Promise<Inventory> {
  return read(await fetch("/api/inventory", { cache: "no-store", signal }));
}

export async function countPhoto(
  pin: string,
  photo: Blob,
  signal: AbortSignal,
): Promise<CountResult> {
  const form = new FormData();
  form.set("image", photo, "case.jpg");
  return read(
    await fetch("/api/inventory/count", {
      method: "POST",
      headers: { "x-staff-pin": pin },
      body: form,
      signal,
    }),
  );
}

async function put(pin: string, body: unknown): Promise<Inventory> {
  return read(
    await fetch("/api/inventory", {
      method: "PUT",
      headers: { "x-staff-pin": pin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export function publishCounts(
  pin: string,
  counts: Record<StockGroupId, number>,
  source: "photo" | "manual",
): Promise<Inventory> {
  return put(pin, {
    groups: Object.entries(counts).map(([groupId, count]) => ({
      groupId,
      count,
    })),
    source,
  });
}

export function setSoldOut(pin: string, on: boolean): Promise<Inventory> {
  return put(pin, { soldOutToggle: on });
}
