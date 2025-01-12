import { NextResponse } from "next/server";
import { getCantinaRepository } from "@/server/data";
import { parseSearchLimit } from "@/server/data/query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const limit = parseSearchLimit(url.searchParams.get("limit"));
  const results = getCantinaRepository().searchNfts(query, limit);

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      },
    },
  );
}
