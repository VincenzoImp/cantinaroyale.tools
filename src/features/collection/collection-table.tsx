"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AssetThumbnail } from "@/features/nft/asset-thumbnail";
import type { FilterOptions } from "@/server/data/repository";
import type {
  CollectionPage,
  CollectionQuery,
  CollectionRow,
  CollectionSortKey,
  CollectionSummary,
  SortDirection,
} from "@/server/data/schema";
import {
  formatCellValue,
  getCollectionColumns,
  getNftValue,
  type CollectionColumn,
} from "./collection-columns";
import {
  CollectionToolbar,
  type CollectionTableState,
} from "./collection-toolbar";
import { createCollectionSearchParams } from "./collection-url-state";

type CollectionApiResponse = {
  page: CollectionPage;
  filters: FilterOptions;
  collection: CollectionSummary;
};

type Props = {
  collection: CollectionSummary;
  initialPage: CollectionPage;
  initialFilters: FilterOptions;
  initialQuery: CollectionQuery;
};

function stateFromQuery(query: CollectionQuery): CollectionTableState {
  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search ?? "",
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
    listing: query.listing,
    collection: query.collection ?? "",
    rarityClass: query.rarityClass ?? "",
    priceCurrency: query.priceCurrency ?? "",
    name: query.name ?? "",
    perk: query.perk ?? "",
    level: query.level?.toString() ?? "",
    starLevel: query.starLevel?.toString() ?? "",
    minPrice: query.minPrice?.toString() ?? "",
    maxPrice: query.maxPrice?.toString() ?? "",
    minRank: query.minRank?.toString() ?? "",
    maxRank: query.maxRank?.toString() ?? "",
    minValue: query.minValue?.toString() ?? "",
    maxValue: query.maxValue?.toString() ?? "",
    minProgress: query.minProgress?.toString() ?? "",
    maxProgress: query.maxProgress?.toString() ?? "",
  };
}

function sortIcon(
  column: CollectionColumn,
  sortBy: CollectionSortKey,
  direction: SortDirection,
) {
  if (!column.sortBy || column.sortBy !== sortBy) {
    return null;
  }

  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
  );
}

function AssetCell({ nft }: { nft: CollectionRow }) {
  return (
    <Link
      href={`/nft/${nft.identifier}`}
      className="flex min-w-[240px] items-center gap-3 rounded py-1 pr-2 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <AssetThumbnail
        type={nft.type}
        url={nft.url}
        thumbnailUrl={nft.thumbnailUrl}
        className="h-12 w-12 rounded-md"
        sizes="48px"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">
          {nft.name}
        </span>
        <span className="block truncate text-xs text-muted">
          {nft.identifier}
        </span>
      </span>
    </Link>
  );
}

function Cell({
  nft,
  column,
}: {
  nft: CollectionRow;
  column: CollectionColumn;
}) {
  if (column.key === "asset") {
    return <AssetCell nft={nft} />;
  }

  const value = getNftValue(nft, column.key);
  return (
    <span className={column.align === "right" ? "tabular-nums" : undefined}>
      {formatCellValue(column.key, value)}
    </span>
  );
}

function MobileResults({
  rows,
  columns,
}: {
  rows: CollectionRow[];
  columns: CollectionColumn[];
}) {
  const mobileColumnsFor = (nft: CollectionRow) => {
    const keys =
      nft.type === "characters"
        ? [
            "collection",
            "priceAmount",
            "value",
            "rank",
            "rarityClass",
            "level",
            "progress",
          ]
        : [
            "collection",
            "priceAmount",
            "value",
            "level",
            "starLevel",
            "damage",
            "range",
            "progress",
          ];
    return keys
      .map((key) => columns.find((column) => column.key === key))
      .filter((column): column is CollectionColumn => column !== undefined);
  };

  return (
    <div data-collection-mobile-results className="grid gap-3 p-3 md:hidden">
      {rows.length > 0 ? (
        rows.map((nft) => (
          <article
            key={nft.identifier}
            className="rounded-md border border-line bg-canvas p-3"
          >
            <Link
              href={`/nft/${nft.identifier}`}
              className="flex min-w-0 items-center gap-3 rounded transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <AssetThumbnail
                type={nft.type}
                url={nft.url}
                thumbnailUrl={nft.thumbnailUrl}
                className="h-14 w-14 rounded-md"
                sizes="56px"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {nft.name}
                </span>
                <span className="block truncate text-xs text-muted">
                  {nft.identifier}
                </span>
              </span>
            </Link>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {mobileColumnsFor(nft).map((column) => {
                const value = getNftValue(nft, column.key);
                return (
                  <div key={column.key} className="min-w-0">
                    <dt className="truncate text-xs uppercase tracking-wide text-muted">
                      {column.label}
                    </dt>
                    <dd className="mt-1 truncate font-medium text-ink">
                      {formatCellValue(column.key, value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))
      ) : (
        <div className="rounded-md border border-line bg-canvas px-4 py-8 text-center text-sm text-muted">
          No NFTs match these filters.
        </div>
      )}
    </div>
  );
}

export function CollectionTable({
  collection,
  initialPage,
  initialFilters,
  initialQuery,
}: Props) {
  const [state, setState] = useState(() => stateFromQuery(initialQuery));
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);
  const initialStateRef = useRef<CollectionTableState | null>(null);
  const columns = useMemo(
    () => getCollectionColumns(collection.type),
    [collection.type],
  );
  const totalPages = Math.max(1, Math.ceil(page.total / state.pageSize));

  if (initialStateRef.current === null) {
    initialStateRef.current = state;
  }

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      if (state === initialStateRef.current) {
        return;
      }
    }

    const controller = new AbortController();
    const params = createCollectionSearchParams(state);
    const url = `/api/collections/${collection.id}?${params.toString()}`;
    window.history.replaceState(
      null,
      "",
      `/collection/${collection.id}?${params}`,
    );

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Collection request failed: ${response.status}`);
        }
        const data = (await response.json()) as CollectionApiResponse;
        setPage(data.page);
        setFilters(data.filters);
        setState((current) =>
          current.page === data.page.page
            ? current
            : { ...current, page: data.page.page },
        );
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error(requestError);
          setError("We couldn't update these results. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [collection.id, state]);

  const updateState = (nextState: CollectionTableState) => {
    setState(nextState);
  };

  const reset = () => {
    setState(
      stateFromQuery({
        ...initialQuery,
        page: 1,
        search: undefined,
        listing: "all",
        collection: undefined,
        rarityClass: undefined,
        priceCurrency: undefined,
        name: undefined,
        perk: undefined,
        level: undefined,
        starLevel: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        minRank: undefined,
        maxRank: undefined,
        minValue: undefined,
        maxValue: undefined,
        minProgress: undefined,
        maxProgress: undefined,
      }),
    );
  };

  const setSort = (column: CollectionColumn) => {
    if (!column.sortBy) return;
    setState((current) => ({
      ...current,
      page: 1,
      sortBy: column.sortBy as CollectionSortKey,
      sortDirection:
        current.sortBy === column.sortBy && current.sortDirection === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      <CollectionToolbar
        state={state}
        columns={columns}
        filters={filters}
        showRarity={collection.type === "characters"}
        onChange={updateState}
      />

      <div
        data-collection-results-bar
        className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 text-sm text-muted"
      >
        <span>
          {page.total.toLocaleString("en")} NFTs, page {state.page} of{" "}
          {totalPages}
        </span>
        <div
          data-collection-results-actions
          className="flex items-center gap-3 sm:justify-end"
        >
          {loading ? <span>Updating...</span> : null}
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-canvas px-3 text-sm font-medium text-ink transition hover:border-strong hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
            disabled={loading}
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      </div>

      {error ? (
        <div className="border-b border-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <MobileResults rows={page.rows} columns={columns} />

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-line px-4 py-3 font-semibold ${
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSort(column)}
                    className="inline-flex items-center gap-1 rounded text-inherit transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {column.label}
                    {sortIcon(column, state.sortBy, state.sortDirection)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.rows.length > 0 ? (
              page.rows.map((nft) => (
                <tr
                  key={nft.identifier}
                  className="border-b border-line transition hover:bg-soft/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`border-b border-line px-4 py-3 align-middle text-ink ${
                        column.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <Cell nft={nft} column={column} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  No NFTs match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-muted">
          NFTs per page
          <span className="relative inline-block">
            <select
              value={state.pageSize}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  page: 1,
                  pageSize: Number(event.target.value),
                }))
              }
              className="h-9 appearance-none rounded-md border border-line bg-canvas py-0 pl-3 pr-10 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-focus/25"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              data-page-size-dropdown-icon
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setState((current) => ({
                ...current,
                page: Math.max(1, current.page - 1),
              }))
            }
            disabled={state.page <= 1 || loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-canvas px-3 text-sm font-medium text-ink transition hover:border-strong hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setState((current) => ({
                ...current,
                page: Math.min(totalPages, current.page + 1),
              }))
            }
            disabled={state.page >= totalPages || loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-canvas px-3 text-sm font-medium text-ink transition hover:border-strong hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
