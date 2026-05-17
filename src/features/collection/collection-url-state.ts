import type { CollectionTableState } from "./collection-toolbar";

function setOptional(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) {
    params.set(key, trimmed);
  }
}

function setOptionalNumber(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  const parsed = Number(trimmed);
  if (Number.isFinite(parsed)) {
    params.set(key, trimmed);
  }
}

export function createCollectionSearchParams(state: CollectionTableState) {
  const params = new URLSearchParams();
  params.set("page", String(state.page));
  params.set("pageSize", String(state.pageSize));
  params.set("sort", state.sortBy);
  params.set("direction", state.sortDirection);

  setOptional(params, "q", state.search);
  if (state.listing !== "all") {
    params.set("listing", state.listing);
  }
  setOptional(params, "collection", state.collection);
  setOptional(params, "rarityClass", state.rarityClass);
  setOptional(params, "priceCurrency", state.priceCurrency);
  setOptional(params, "name", state.name);
  setOptional(params, "perk", state.perk);
  setOptionalNumber(params, "level", state.level);
  setOptionalNumber(params, "starLevel", state.starLevel);
  setOptionalNumber(params, "minPrice", state.minPrice);
  setOptionalNumber(params, "maxPrice", state.maxPrice);
  setOptionalNumber(params, "minRank", state.minRank);
  setOptionalNumber(params, "maxRank", state.maxRank);
  setOptionalNumber(params, "minValue", state.minValue);
  setOptionalNumber(params, "maxValue", state.maxValue);
  setOptionalNumber(params, "minProgress", state.minProgress);
  setOptionalNumber(params, "maxProgress", state.maxProgress);

  return params;
}
