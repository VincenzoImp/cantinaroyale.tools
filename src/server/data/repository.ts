import type {
  CollectionPage,
  CollectionQuery,
  CollectionSummary,
  CollectionType,
  Nft,
  SearchResult,
} from "./schema";

export const ALL_CHARACTERS_ID = "All-Characters";
export const ALL_WEAPONS_ID = "All-Weapons";

export type CollectionGroups = {
  characters: CollectionSummary[];
  weapons: CollectionSummary[];
  allCharacters: CollectionSummary;
  allWeapons: CollectionSummary;
};

export type HomeStats = {
  totalNfts: number;
  listedNfts: number;
  characterCount: number;
  weaponCount: number;
  totalCollections: number;
};

export type HomeMarketInsight = {
  type: CollectionType;
  label: string;
  total: number;
  listed: number;
  floorPrice: number | null;
  averagePrice: number | null;
  averageValue: number | null;
};

export type HomeCollectionInsight = {
  id: string;
  name: string;
  type: CollectionType;
  nftCount: number;
  listedCount: number;
  floorPrice: number | null;
  averageValue: number | null;
};

export type HomeDistributionItem = {
  label: string;
  count: number;
};

export type HomeWeaponStarCell = {
  starLevel: number;
  count: number;
};

export type HomeWeaponStarMatrixRow = {
  weapon: string;
  total: number;
  stars: HomeWeaponStarCell[];
};

export type HomeInsights = {
  market: HomeMarketInsight[];
  topCollections: HomeCollectionInsight[];
  rarityDistribution: HomeDistributionItem[];
  weaponFamilies: HomeDistributionItem[];
  weaponStarMatrix: HomeWeaponStarMatrixRow[];
  topPerks: HomeDistributionItem[];
  starDistribution: HomeDistributionItem[];
};

export type FilterOptions = {
  collections: string[];
  rarityClasses: string[];
  priceCurrencies: string[];
  names: string[];
  perks: string[];
  levels: number[];
  starLevels: number[];
};

export interface CantinaRepository {
  close(): void;
  listCollections(): CollectionSummary[];
  getCollectionGroups(): CollectionGroups;
  getCollectionSummary(identifier: string): CollectionSummary | null;
  getCollectionType(identifier: string): CollectionType | null;
  getHomeStats(): HomeStats;
  getHomeInsights(): HomeInsights;
  getCollectionPage(query: CollectionQuery): CollectionPage;
  getFilterOptions(
    identifier: string,
    type: CollectionType,
  ): FilterOptions;
  findNft(identifier: string): Nft | null;
  searchNfts(search: string, limit: number): SearchResult[];
}
