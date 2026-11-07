import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { MAX_UPLOAD_BYTES, VisionError, countDonuts } from "@/lib/vision/count";

export const dynamic = "force-dynamic";

// Photo → CountResult. Staff only; nothing is saved (publishing is PUT /api/inventory).
export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const length = Number(req.headers.get("content-length") || 0);
    if (length > MAX_UPLOAD_BYTES + 64 * 1024)
      return json({ error: "Photo is too large. Try again." }, 413);
    const image = (await req.formData().catch(() => null))?.get("image");
    if (!(image instanceof Blob) || image.size === 0)
      return json({ error: "Missing image file" }, 400);
    if (image.type && !image.type.startsWith("image/"))
      return json({ error: "That file isn't a photo" }, 415);
    if (image.size > MAX_UPLOAD_BYTES)
      return json({ error: "Photo is too large. Try again." }, 413);
    try {
      const { result, timing } = await countDonuts(
        Buffer.from(await image.arrayBuffer()),
      );
      console.info(
        `Vision count: ${timing.model} ${timing.primaryMs}ms` +
          (timing.secondModel
            ? `, second ${timing.secondModel} ${timing.secondStatus} ${timing.secondMs ?? "-"}ms`
            : "") +
          `, total ${timing.totalMs}ms (${timing.width}x${timing.height})`,
      );
      return Response.json(result, {
        headers: {
          "Cache-Control": "no-store",
          "Server-Timing": `resize;dur=${timing.resizeMs}, vision;dur=${timing.primaryMs}, total;dur=${timing.totalMs}`,
        },
      });
    } catch (e) {
      if (e instanceof VisionError) return json({ error: e.message }, e.status);
      throw e;
    }
  });
}
