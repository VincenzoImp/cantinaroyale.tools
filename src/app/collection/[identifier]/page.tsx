import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { CollectionPage } from "@/features/collection/collection-page";
import { getCantinaRepository } from "@/server/data";
import { parseCollectionSearchParamsOrDefault } from "@/server/data/query";

type PageProps = {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toURLSearchParams(
  values: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { identifier } = await params;
  const collection = getCantinaRepository().getCollectionSummary(identifier);

  return {
    title: collection ? collection.name : "Collection not found",
    description: collection?.description ?? undefined,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { identifier } = await params;
  const repository = getCantinaRepository();
  const type = repository.getCollectionType(identifier);

  if (!type) {
    notFound();
  }

  const query = parseCollectionSearchParamsOrDefault(
    identifier,
    type,
    toURLSearchParams(await searchParams),
  );
  const collection = repository.getCollectionSummary(identifier);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <Navbar activeItemID={type} />
      <CollectionPage
        collection={collection}
        initialPage={repository.getCollectionPage(query)}
        filters={repository.getFilterOptions(identifier, type)}
        query={query}
      />
      <Footer />
    </>
  );
}
