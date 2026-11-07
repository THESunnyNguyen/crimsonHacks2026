import { handle, json } from "@/lib/http";
import { getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => json(await getMenu()));
}
