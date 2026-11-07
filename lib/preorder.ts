import { z } from "zod";
import menu from "@/data/menu.json";
import { orderSchema } from "./validation";
import { pickupTimes } from "./pickup";

export const preorderSchema = orderSchema
  .omit({ source: true })
  .extend({
    phone: z
      .string()
      .trim()
      .min(7)
      .max(40)
      .regex(/^[+\d\s().-]+$/)
      .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a phone number"),
  })
  .refine(
    (o) => o.items.reduce((n, i) => n + i.qty, 0) <= 36,
    "Choose at most 36 donuts",
  )
  .refine(
    (o) =>
      o.items.every((i) =>
        menu.some(
          (m) => m.id === i.menuItemId && m.price !== null && m.stockGroup,
        ),
      ),
    "Choose donuts from the priced menu",
  );
export type PreorderInput = z.infer<typeof preorderSchema>;

export function parsePreorder(value: unknown, now = new Date()): PreorderInput {
  const input = preorderSchema.parse(value);
  if (!pickupTimes(input.pickupDate, now).includes(input.pickupTime)) {
    throw new Response(
      JSON.stringify({
        error:
          "Choose an available pickup time today or tomorrow. Closed Sunday; allow at least 15 minutes.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  return input;
}

export function totalCents(input: PreorderInput): number {
  return input.items.reduce((sum, i) => {
    const item = menu.find((m) => m.id === i.menuItemId);
    if (item?.price == null)
      throw new Error("Item is not available for preorder");
    return sum + Math.round(item.price * 100) * i.qty;
  }, 0);
}
