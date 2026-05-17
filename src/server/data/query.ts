import {
  collectionQuerySchema,
  type CollectionQuery,
  type CollectionType,
} from "./schema";

function getParam(params: URLSearchParams, ...names: string[]) {
  for (const name of names) {
    const value = params.get(name);
    if (value !== null) {
      return value;
    }
  }

  return undefined;
}

export function parseCollectionSearchParams(
  identifier: string,
  type: CollectionType,
  params: URLSearchParams,
): CollectionQuery {
  return collectionQuerySchema.parse({
    identifier,
    type,
    page: getParam(params, "page"),
    pageSize: getParam(params, "pageSize", "limit"),
    search: getParam(params, "q", "search"),
    sortBy: getParam(params, "sort", "sortBy"),
    sortDirection: getParam(params, "direction", "sortDirection"),
    listing: getParam(params, "listing"),
    collection: getParam(params, "collection"),
    rarityClass: getParam(params, "rarityClass"),
    priceCurrency: getParam(params, "priceCurrency"),
    name: getParam(params, "name"),
    perk: getParam(params, "perk"),
    level: getParam(params, "level"),
    starLevel: getParam(params, "starLevel"),
    minPrice: getParam(params, "minPrice"),
    maxPrice: getParam(params, "maxPrice"),
    minRank: getParam(params, "minRank"),
    maxRank: getParam(params, "maxRank"),
    minValue: getParam(params, "minValue"),
    maxValue: getParam(params, "maxValue"),
    minProgress: getParam(params, "minProgress"),
    maxProgress: getParam(params, "maxProgress"),
  });
}

export function parseCollectionSearchParamsOrDefault(
  identifier: string,
  type: CollectionType,
  params: URLSearchParams,
): CollectionQuery {
  const parsed = collectionQuerySchema.safeParse({
    identifier,
    type,
    page: getParam(params, "page"),
    pageSize: getParam(params, "pageSize", "limit"),
    search: getParam(params, "q", "search"),
    sortBy: getParam(params, "sort", "sortBy"),
    sortDirection: getParam(params, "direction", "sortDirection"),
    listing: getParam(params, "listing"),
    collection: getParam(params, "collection"),
    rarityClass: getParam(params, "rarityClass"),
    priceCurrency: getParam(params, "priceCurrency"),
    name: getParam(params, "name"),
    perk: getParam(params, "perk"),
    level: getParam(params, "level"),
    starLevel: getParam(params, "starLevel"),
    minPrice: getParam(params, "minPrice"),
    maxPrice: getParam(params, "maxPrice"),
    minRank: getParam(params, "minRank"),
    maxRank: getParam(params, "maxRank"),
    minValue: getParam(params, "minValue"),
    maxValue: getParam(params, "maxValue"),
    minProgress: getParam(params, "minProgress"),
    maxProgress: getParam(params, "maxProgress"),
  });

  if (parsed.success) {
    return parsed.data;
  }

  return collectionQuerySchema.parse({ identifier, type });
}

export function parseSearchLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return 8;
  }

  return Math.max(1, Math.min(parsed, 20));
}
