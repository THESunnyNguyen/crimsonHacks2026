import { z } from "zod";
import menu from "@/data/menu.json";
export const groupId = z.enum(["raised", "cake", "specialty", "filled_bars"]);
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v + "T12:00:00Z"); return !isNaN(d.getTime()) && d.toISOString().slice(0,10) === v; }, "Invalid date");
export const statusSchema = z.enum(["new", "ready", "picked_up", "cancelled"]);
export const countsSchema = z.object({ groups: z.array(z.object({ groupId, count: z.number().int().min(0).max(10000) }).strict()).min(1).max(4).refine(g => new Set(g.map(x => x.groupId)).size === g.length, "Duplicate groups"), source: z.enum(["photo", "manual", "casecam"]) }).strict();
export const inventorySchema = z.union([countsSchema, z.object({ soldOutToggle: z.boolean() }).strict()]);
export const orderSchema = z.object({ customerName: z.string().trim().min(1).max(100), phone: z.string().trim().max(40).optional(), pickupDate: dateSchema, pickupTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/), items: z.array(z.object({ menuItemId: z.string(), qty: z.number().int().min(1).max(500), option: z.string().max(100).optional() }).strict().refine(i => menu.some(m => m.id === i.menuItemId && (!i.option || ("options" in m && m.options?.includes(i.option)))), "Unknown menu item or option")).min(1).max(50), notes: z.string().max(2000).optional(), source: z.enum(["staff_form", "notes", "web"]) }).strict();
