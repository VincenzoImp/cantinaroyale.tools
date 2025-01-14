import type {
  CollectionPage,
  CollectionQuery,
  CollectionSummary,
  CollectionType,
  Nft,
  SearchResult,
} from "./schema";
import type { GameplaySummary } from "./gameplay";

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

export type HomeMarketSegment = {
  label: string;
  detail: string;
  total: number;
  listed: number;
  floorPrice: number | null;
  averagePrice: number | null;
  averageValue: number | null;
};

export type HomeDistributionItem = {
  label: string;
  count: number;
};

export type HomeSpeciesRarityDistribution = {
  species: string;
  total: number;
  items: HomeDistributionItem[];
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
  characterMarket: HomeMarketSegment[];
  weaponMarket: HomeMarketSegment[];
  characterRarityBySpecies: HomeSpeciesRarityDistribution[];
  weaponFamilies: HomeDistributionItem[];
  weaponStarMatrix: HomeWeaponStarMatrixRow[];
  perkDistribution: HomeDistributionItem[];
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

export type GameplayPerk = {
  id: string;
  name: string;
  description: string;
  minRoll: number | null;
  minCoefficient: number | null;
  maxRoll: number | null;
  maxCoefficient: number | null;
};

export type GameplayAmount = {
  itemId: string;
  amount: number;
};

export type GameplayReward = {
  rewardType: string;
  rewardId: string | null;
  amountMin: number | null;
  amountMax: number | null;
  chance: number | null;
};

export type GameplayLevelCost = {
  level: number;
  requiredTokens?: number | null;
  xpNeeded?: number | null;
  price: GameplayAmount[];
  rewards: GameplayReward[];
};

export type CharacterLevelProgression = {
  level: number;
  averageHealth: number | null;
  averageShield: number | null;
  talentPoints: number | null;
  skillLevel: number | null;
  crownEarnRate: number | null;
};

export type CharacterProfileLevelProgression = {
  level: number;
  health: number | null;
  shield: number | null;
  talentPoints: number | null;
  skillLevel: number | null;
  crownEarnRate: number | null;
};

export type CharacterProfileProgression = {
  key: string;
  label: string;
  species: string;
  rarity: string;
  levels: CharacterProfileLevelProgression[];
};

export type GameplayStatProfile = {
  key: string;
  label: string;
  species?: string;
  rarity?: string;
  stats: {
    label: string;
    value: number | null;
  }[];
};

export type GameplayCurrencyUsage = {
  itemId: string;
  totalAmount: number;
  uses: number;
};

export type GameplayEconomyCost = {
  category: string;
  label: string;
  requirement: string | null;
  price: GameplayAmount[];
  rewards: GameplayReward[];
};

export type CharacterGameplayDashboard = {
  perks: GameplayPerk[];
  rarityProfiles: HomeDistributionItem[];
  speciesProfiles: HomeDistributionItem[];
  levelProgression: CharacterLevelProgression[];
  profileProgression: CharacterProfileProgression[];
  statProfiles: GameplayStatProfile[];
  levelCosts: GameplayLevelCost[];
};

export type WeaponGameplayDashboard = {
  weaponCollections: HomeDistributionItem[];
  starDistribution: HomeDistributionItem[];
  starBonuses: {
    weapon: string;
    collectionId: string;
    starLevel: number;
    damageIncrease: number | null;
    statLabel: string | null;
    statValue: number | null;
    fusePrice: GameplayAmount[];
    fuseRewards: GameplayReward[];
    dismantleRewards: GameplayReward[];
  }[];
  baseStats: {
    weapon: string;
    stats: {
      label: string;
      value: string;
    }[];
  }[];
  levelCosts: GameplayLevelCost[];
};

export type EconomyGameplayDashboard = {
  currencyUsage: GameplayCurrencyUsage[];
  upgradeCosts: GameplayEconomyCost[];
};

export type GameplayCharacterProfile = {
  id: string;
  rarity: string;
  species: string;
  raceId: string | null;
  roleId: string | null;
  speed: number | null;
  talentId: string | null;
  skillId: string | null;
  totalSupply: number | null;
  nftTokenId: string | null;
};

export type GameplayCharacterLevel = {
  level: number;
  health: number;
  shield: number;
  talentPoints: number;
  skillLevel: number;
  crownEarnRate: number;
};

export type GameplayCharacterUpgrade = {
  level: number;
  requiredTokens: number | null;
  price: GameplayAmount[];
  rewards: GameplayReward[];
};

export type GameplayCharacterSkillStat = {
  statType: string;
  label: string;
  currentValue: string | null;
  nextValue: string | null;
};

export type GameplayWeaponStarBonus = {
  starLevel: number;
  damageIncrease: number | null;
  statType: string | null;
  statLabel: string | null;
  statValue: number | null;
  fuseItemCount: number | null;
};

export type GameplayWeaponLevel = {
  level: number;
  xpNeeded: number | null;
  price: GameplayAmount[];
  rewards: GameplayReward[];
};

export type GameplayWeaponDetail = {
  weaponType: string;
  collectionId: string;
  currentStarBonus: GameplayWeaponStarBonus | null;
  allStarBonuses: GameplayWeaponStarBonus[];
  baseStats: {
    statType: string;
    label: string;
    value: string;
  }[];
  nextLevel: GameplayWeaponLevel | null;
  fusePrice: GameplayAmount[];
  fuseRewards: GameplayReward[];
  dismantleRewards: GameplayReward[];
};

export type GameplayCharacterDetail = {
  profile: GameplayCharacterProfile | null;
  currentLevel: GameplayCharacterLevel | null;
  nextLevel: GameplayCharacterLevel | null;
  maxLevel: GameplayCharacterLevel | null;
  nextUpgrade: GameplayCharacterUpgrade | null;
  skillStats: GameplayCharacterSkillStat[];
};

export type NftGameplay = {
  perks: GameplayPerk[];
  character?: GameplayCharacterDetail;
  weapon?: GameplayWeaponDetail;
};

export interface CantinaRepository {
  close(): void;
  listCollections(): CollectionSummary[];
  getCollectionGroups(): CollectionGroups;
  getCollectionSummary(identifier: string): CollectionSummary | null;
  getCollectionType(identifier: string): CollectionType | null;
  getHomeStats(): HomeStats;
  getHomeInsights(): HomeInsights;
  getGameplaySummary(): GameplaySummary;
  getNftGameplay(identifier: string): NftGameplay | null;
  getCharacterGameplayDashboard(): CharacterGameplayDashboard;
  getWeaponGameplayDashboard(): WeaponGameplayDashboard;
  getEconomyGameplayDashboard(): EconomyGameplayDashboard;
  getCollectionPage(query: CollectionQuery): CollectionPage;
  getFilterOptions(identifier: string, type: CollectionType): FilterOptions;
  findNft(identifier: string): Nft | null;
  searchNfts(search: string, limit: number): SearchResult[];
}
