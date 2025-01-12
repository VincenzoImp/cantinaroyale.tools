import type { FilterOptions } from "@/server/data/repository";
import type {
  CollectionPage as CollectionPageData,
  CollectionQuery,
  CollectionSummary,
} from "@/server/data/schema";
import { CollectionTable } from "./collection-table";

type Props = {
  collection: CollectionSummary;
  initialPage: CollectionPageData;
  filters: FilterOptions;
  query: CollectionQuery;
};

export function CollectionPage({
  collection,
  initialPage,
  filters,
  query,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {collection.type === "characters" ? "Characters" : "Weapons"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            {collection.name}
          </h1>
          {collection.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {collection.description}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-surface px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-muted">
              NFTs
            </div>
            <div className="mt-1 text-2xl font-semibold text-ink">
              {collection.nftCount.toLocaleString("en")}
            </div>
          </div>
          <div className="rounded-md border border-line bg-surface px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-muted">
              Owners
            </div>
            <div className="mt-1 text-2xl font-semibold text-ink">
              {collection.holderCount?.toLocaleString("en") ?? "-"}
            </div>
          </div>
          <div className="rounded-md border border-line bg-surface px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-muted">
              Results
            </div>
            <div className="mt-1 text-2xl font-semibold text-ink">
              {initialPage.total.toLocaleString("en")}
            </div>
          </div>
        </div>
      </header>

      <CollectionTable
        collection={collection}
        initialPage={initialPage}
        initialFilters={filters}
        initialQuery={query}
      />
    </main>
  );
}
