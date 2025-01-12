import type {
  CollectionRow,
  CollectionSortKey,
  CollectionType,
} from "@/server/data/schema";

export type CollectionColumn = {
  key:
    | "asset"
    | "collection"
    | "priceAmount"
    | "value"
    | "discount"
    | "rank"
    | "rarityClass"
    | "level"
    | "health"
    | "shield"
    | "progress"
    | "starLevel"
    | "damage"
    | "reloadTime"
    | "ammo"
    | "range";
  label: string;
  sortBy?: CollectionSortKey;
  align?: "left" | "right";
};

const COMMON_COLUMNS = [
  { key: "asset", label: "NFT", sortBy: "name" },
  { key: "collection", label: "Collection", sortBy: "collection" },
  { key: "priceAmount", label: "Price", sortBy: "priceAmount", align: "right" },
  { key: "value", label: "Est. value", sortBy: "value", align: "right" },
  { key: "discount", label: "Discount", sortBy: "discount", align: "right" },
] satisfies CollectionColumn[];

const CHARACTER_COLUMNS = [
  ...COMMON_COLUMNS,
  { key: "rank", label: "Rank", sortBy: "rank", align: "right" },
  { key: "rarityClass", label: "Rarity", sortBy: "rarityClass" },
  { key: "level", label: "Level", sortBy: "level", align: "right" },
  { key: "health", label: "Health", sortBy: "health", align: "right" },
  { key: "shield", label: "Shield", sortBy: "shield", align: "right" },
  { key: "progress", label: "Progress", sortBy: "progress", align: "right" },
] satisfies CollectionColumn[];

const WEAPON_COLUMNS = [
  ...COMMON_COLUMNS,
  { key: "level", label: "Level", sortBy: "level", align: "right" },
  { key: "starLevel", label: "Stars", sortBy: "starLevel", align: "right" },
  { key: "damage", label: "Damage", sortBy: "damage", align: "right" },
  {
    key: "reloadTime",
    label: "Reload time",
    sortBy: "reloadTime",
    align: "right",
  },
  { key: "ammo", label: "Ammo", sortBy: "ammo", align: "right" },
  { key: "range", label: "Range", sortBy: "range", align: "right" },
  { key: "progress", label: "Progress", sortBy: "progress", align: "right" },
] satisfies CollectionColumn[];

export function getCollectionColumns(type: CollectionType) {
  return type === "characters" ? CHARACTER_COLUMNS : WEAPON_COLUMNS;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(value: number) {
  if (value < 0.001) {
    return `${value.toFixed(6)} EGLD`;
  }

  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: value < 1 ? 4 : 3,
  }).format(value)} EGLD`;
}

export function formatCellValue(
  key: CollectionColumn["key"] | CollectionSortKey,
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  if (key === "priceAmount") {
    return formatPrice(value);
  }

  if (key === "discount" || key === "progress") {
    return `${value.toFixed(2)}%`;
  }

  if (key === "reloadTime") {
    return `${value.toFixed(2)}s`;
  }

  return formatNumber(value);
}

export function getNftValue(nft: CollectionRow, key: CollectionColumn["key"]) {
  if (key === "asset") {
    return nft.name;
  }

  if (key in nft) {
    return nft[key as keyof CollectionRow] as string | number | null | undefined;
  }

  return undefined;
}
