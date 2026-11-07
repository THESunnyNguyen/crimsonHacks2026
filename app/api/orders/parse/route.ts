import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { DraftError, parseBodySchema, parseOrder } from "@/lib/parse/order";
import { getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const { text } = parseBodySchema.parse(await req.json());
    try {
      return json(await parseOrder(text, await getMenu()));
    } catch (e) {
      if (e instanceof DraftError)
        return json(
          { error: "Could not create a complete draft. Enter the order manually." },
          422,
        );
      throw e;
    }
  });
}
