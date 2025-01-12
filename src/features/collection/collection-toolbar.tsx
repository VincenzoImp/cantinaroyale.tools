"use client";

import { ChevronDown, SlidersHorizontal, RotateCcw, Search } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import type {
  CollectionSortKey,
  ListingFilter,
  SortDirection,
} from "@/server/data/schema";
import type { FilterOptions } from "@/server/data/repository";
import type { CollectionColumn } from "./collection-columns";

export type CollectionTableState = {
  page: number;
  pageSize: number;
  search: string;
  sortBy: CollectionSortKey;
  sortDirection: SortDirection;
  listing: ListingFilter;
  collection: string;
  rarityClass: string;
  priceCurrency: string;
  name: string;
  perk: string;
  level: string;
  starLevel: string;
  minPrice: string;
  maxPrice: string;
  minRank: string;
  maxRank: string;
  minValue: string;
  maxValue: string;
  minProgress: string;
  maxProgress: string;
};

type Props = {
  state: CollectionTableState;
  columns: CollectionColumn[];
  filters: FilterOptions;
  showRarity: boolean;
  loading: boolean;
  onChange: (nextState: CollectionTableState) => void;
  onReset: () => void;
};

function fieldId(name: string) {
  return `collection-toolbar-${name}`;
}

const selectClass =
  "h-10 w-full min-w-0 appearance-none rounded-md border border-line bg-canvas py-0 pl-3 pr-10 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-focus/25";

const compactInputClass =
  "h-9 w-full min-w-0 rounded-md border border-line bg-canvas px-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-focus/25";

function FilterGroup({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-collection-filter-group
      className={`flex h-full min-w-0 flex-col rounded-md border border-line bg-canvas/60 p-3 ${className}`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      <div className="mt-2 grid gap-2">{children}</div>
    </section>
  );
}

function RangeGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded border border-line bg-canvas p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      <div className="mt-2 grid min-w-0 grid-cols-2 gap-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted">
      {label}
      {children}
    </label>
  );
}

function SelectControl({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span data-dropdown-control className="relative block min-w-0">
      <select {...props} className={selectClass}>
        {children}
      </select>
      <ChevronDown
        data-dropdown-icon
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </span>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className={compactInputClass}
      />
    </Field>
  );
}

export function CollectionToolbar({
  state,
  columns,
  filters,
  showRarity,
  loading,
  onChange,
  onReset,
}: Props) {
  const sortableColumns = columns.filter((column) => column.sortBy);

  const update = (patch: Partial<CollectionTableState>) => {
    onChange({ ...state, ...patch, page: patch.page ?? 1 });
  };

  return (
    <div className="border-b border-line bg-surface px-4 py-4">
      <div
        data-collection-filter-scroll
        className="-mx-4 overflow-x-auto px-4 pb-1"
      >
        <div
          data-collection-filter-grid
          className="grid min-w-[1160px] grid-cols-5 items-stretch gap-3"
        >
          <FilterGroup title="Search">
            <Field label="Search NFTs">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                />
                <input
                  id={fieldId("search")}
                  value={state.search}
                  onChange={(event) => update({ search: event.target.value })}
                  className="h-10 w-full rounded-md border border-line bg-canvas px-3 pl-9 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus/25"
                  placeholder="Name, ID, owner, trait"
                />
              </div>
            </Field>
          </FilterGroup>

          <FilterGroup title="Market">
            <Field label="Sale status">
              <SelectControl
                value={state.listing}
                onChange={(event) =>
                  update({ listing: event.target.value as ListingFilter })
                }
              >
                <option value="all">All NFTs</option>
                <option value="listed">For sale</option>
                <option value="unlisted">Not for sale</option>
              </SelectControl>
            </Field>
            <Field label="Currency">
              <SelectControl
                value={state.priceCurrency}
                onChange={(event) => update({ priceCurrency: event.target.value })}
              >
                <option value="">Any currency</option>
                {filters.priceCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </SelectControl>
            </Field>
          </FilterGroup>

          <FilterGroup title="Collection">
            <Field label="Collection">
              <SelectControl
                value={state.collection}
                onChange={(event) => update({ collection: event.target.value })}
              >
                <option value="">All collections</option>
                {filters.collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </SelectControl>
            </Field>
            {showRarity ? (
              <Field label="Rarity">
                <SelectControl
                  value={state.rarityClass}
                  onChange={(event) => update({ rarityClass: event.target.value })}
                >
                  <option value="">All rarities</option>
                  {filters.rarityClasses.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </SelectControl>
              </Field>
            ) : (
              <Field label="Weapon family">
                <SelectControl
                  value={state.name}
                  onChange={(event) => update({ name: event.target.value })}
                >
                  <option value="">All weapons</option>
                  {filters.names.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </SelectControl>
              </Field>
            )}
          </FilterGroup>

          <FilterGroup title="Gameplay">
            <Field label={showRarity ? "Perk" : "Stars"}>
              <SelectControl
                value={showRarity ? state.perk : state.starLevel}
                onChange={(event) =>
                  showRarity
                    ? update({ perk: event.target.value })
                    : update({ starLevel: event.target.value })
                }
              >
                <option value="">{showRarity ? "Any perk" : "Any stars"}</option>
                {(showRarity ? filters.perks : filters.starLevels).map((value) => (
                  <option key={value} value={value}>
                    {showRarity ? value : `${value} star${value === 1 ? "" : "s"}`}
                  </option>
                ))}
              </SelectControl>
            </Field>
            <Field label="Level">
              <SelectControl
                value={state.level}
                onChange={(event) => update({ level: event.target.value })}
              >
                <option value="">Any level</option>
                {filters.levels.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </SelectControl>
            </Field>
          </FilterGroup>

          <FilterGroup title="Sort">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="Sort by">
                <SelectControl
                  value={state.sortBy}
                  onChange={(event) =>
                    update({ sortBy: event.target.value as CollectionSortKey })
                  }
                >
                  {sortableColumns.map((column) => (
                    <option key={column.key} value={column.sortBy}>
                      {column.label}
                    </option>
                  ))}
                </SelectControl>
              </Field>
              <Field label="Order">
                <SelectControl
                  value={state.sortDirection}
                  onChange={(event) =>
                    update({ sortDirection: event.target.value as SortDirection })
                  }
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </SelectControl>
              </Field>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-canvas px-3 text-sm font-medium text-ink transition hover:border-strong hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
              disabled={loading}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear filters
            </button>
          </FilterGroup>
        </div>
      </div>

      <details className="mt-3 rounded-md border border-line bg-canvas/60">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium text-ink">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-primary" />
          More filters
        </summary>
        <div
          data-collection-more-filter-scroll
          className="overflow-x-auto border-t border-line"
        >
          <div
            data-collection-more-filter-grid
            className="grid min-w-[720px] gap-3 p-3 md:min-w-0 md:grid-cols-2 xl:grid-cols-4"
          >
          <RangeGroup title="Price">
            <NumberField
              label="From"
              value={state.minPrice}
              onChange={(value) => update({ minPrice: value })}
            />
            <NumberField
              label="To"
              value={state.maxPrice}
              onChange={(value) => update({ maxPrice: value })}
            />
          </RangeGroup>
          {showRarity ? (
            <RangeGroup title="Rank">
              <NumberField
                label="From"
                value={state.minRank}
                onChange={(value) => update({ minRank: value })}
              />
              <NumberField
                label="To"
                value={state.maxRank}
                onChange={(value) => update({ maxRank: value })}
              />
            </RangeGroup>
          ) : null}
          <RangeGroup title="Estimated value">
            <NumberField
              label="From"
              value={state.minValue}
              onChange={(value) => update({ minValue: value })}
            />
            <NumberField
              label="To"
              value={state.maxValue}
              onChange={(value) => update({ maxValue: value })}
            />
          </RangeGroup>
          <RangeGroup title="Progress">
            <NumberField
              label="From"
              value={state.minProgress}
              onChange={(value) => update({ minProgress: value })}
            />
            <NumberField
              label="To"
              value={state.maxProgress}
              onChange={(value) => update({ maxProgress: value })}
            />
          </RangeGroup>
          </div>
        </div>
      </details>
    </div>
  );
}
