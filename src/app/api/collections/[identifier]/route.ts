import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCantinaRepository } from "@/server/data";
import { parseCollectionSearchParams } from "@/server/data/query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ identifier: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { identifier } = await context.params;
  const repository = getCantinaRepository();
  const type = repository.getCollectionType(identifier);

  if (!type) {
    return NextResponse.json(
      { error: `Unknown collection: ${identifier}` },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  let query: ReturnType<typeof parseCollectionSearchParams>;
  try {
    query = parseCollectionSearchParams(identifier, type, url.searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid collection query", issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
  const page = repository.getCollectionPage(query);
  const filters = repository.getFilterOptions(identifier, type);

  return NextResponse.json(
    {
      collection: repository.getCollectionSummary(identifier),
      filters,
      page,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      },
    },
  );
}
