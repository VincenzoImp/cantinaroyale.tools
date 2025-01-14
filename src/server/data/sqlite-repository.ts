import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import {
  ALL_CHARACTERS_ID,
  ALL_WEAPONS_ID,
  type CantinaRepository,
  type CharacterGameplayDashboard,
  type CharacterLevelProgression,
  type CharacterProfileProgression,
  type CollectionGroups,
  type EconomyGameplayDashboard,
  type FilterOptions,
  type HomeDistributionItem,
  type HomeInsights,
  type HomeMarketInsight,
  type HomeMarketSegment,
  type HomeSpeciesRarityDistribution,
  type GameplayAmount,
  type GameplayCharacterDetail,
  type GameplayCharacterLevel,
  type GameplayCharacterProfile,
  type GameplayCharacterSkillStat,
  type GameplayCurrencyUsage,
  type GameplayEconomyCost,
  type GameplayPerk,
  type GameplayReward,
  type GameplayStatProfile,
  type GameplayLevelCost,
  type GameplayWeaponDetail,
  type GameplayWeaponLevel,
  type GameplayWeaponStarBonus,
  type HomeStats,
  type HomeWeaponStarMatrixRow,
  type NftGameplay,
  type WeaponGameplayDashboard,
} from "./repository";
import {
  collectionPageSchema,
  collectionRowSchema,
  collectionSummarySchema,
  nftSchema,
  searchResultSchema,
  type CollectionQuery,
  type CollectionRow,
  type CollectionSortKey,
  type CollectionSummary,
  type CollectionType,
  type Nft,
  type SearchResult,
  type SortDirection,
} from "./schema";
import { DEFAULT_DATABASE_PATH } from "./paths";
import { summarizeGameplayData } from "./gameplay";

type CollectionSummaryRow = {
  id: string;
  name: string;
  type: CollectionType;
  nft_count: number;
  holder_count: number | null;
  description: string | null;
  icon_url: string | null;
};

type NftRow = {
  identifier: string;
  collection: string;
  type: CollectionType;
  name: string;
  url: string | null;
  thumbnail_url: string | null;
  owner: string | null;
  rank: number | null;
  price_currency: string | null;
  price_amount: number | null;
  value: number | null;
  discount: number | null;
  progress: number | null;
  rarity_class: string | null;
  perk1: string | null;
  perk2: string | null;
  level: number | null;
  character_tokens: number | null;
  health: number | null;
  shield: number | null;
  talent_points_available: number | null;
  talent_points_total: number | null;
  earn_rate: number | null;
  xp: number | null;
  wear: number | null;
  star_level: number | null;
  damage: number | null;
  reload_time: number | null;
  ammo: number | null;
  range_value: number | null;
  attributes_json: string;
};

type CollectionPageRow = Omit<NftRow, "attributes_json">;

type CountRow = {
  total: number;
};

type StatRow = {
  total_nfts: number;
  listed_nfts: number;
  character_count: number;
  weapon_count: number;
  total_collections: number;
};

type MarketInsightRow = {
  type: CollectionType;
  total: number;
  listed: number;
  floor_price: number | null;
  average_price: number | null;
  average_value: number | null;
};

type MarketSegmentRow = {
  label: string | null;
  detail: string | null;
  total: number;
  listed: number;
  floor_price: number | null;
  average_price: number | null;
  average_value: number | null;
};

type DistributionRow = {
  label: string | null;
  count: number;
};

type SpeciesRarityRow = {
  species: string | null;
  rarity: string | null;
  count: number;
};

type WeaponStarRow = {
  weapon: string;
  star_level: number;
  count: number;
};

type DistinctValueRow = {
  value: string | null;
};

type DistinctNumberRow = {
  value: number | null;
};

type GameplayPerkRow = {
  id: string;
  name: string;
  description: string;
  min_roll: number | null;
  min_coefficient: number | null;
  max_roll: number | null;
  max_coefficient: number | null;
};

type GameplayCharacterProfileRow = {
  id: string;
  rarity: number | null;
  species: string;
  race_id: string | null;
  role_id: string | null;
  speed: number | null;
  talent_id: string | null;
  skill_id: string | null;
  total_supply: number | null;
  nft_token_id: string | null;
};

type GameplayCharacterLevelRow = {
  level: number;
  health: number;
  shield: number;
  talent_points: number;
  skill_level: number;
  crown_earn_rate: number;
};

type GameplayCharacterProgressionRow = GameplayCharacterLevelRow & {
  character_id: string;
  species: string | null;
  rarity: number | null;
};

type GameplayCharacterStatProfileRow = {
  row_index: number;
  id: string;
  species: string;
  rarity: number | null;
  speed: number | null;
  health: number | null;
  shield: number | null;
  talent_points: number | null;
  skill_level: number | null;
  crown_earn_rate: number | null;
};

type GameplayCharacterUpgradeRow = {
  level: number;
  nft_character_price_id: string | null;
  required_tokens: number | null;
  reward_pool_id: string | null;
};

type GameplayCharacterSkillRow = {
  stat_type: string;
  stat_value_level_1: string | null;
  stat_value_level_2: string | null;
  stat_value_level_3: string | null;
  stat_value_level_4: string | null;
  stat_value_level_5: string | null;
  stat_value_level_6: string | null;
  stat_value_level_7: string | null;
  stat_value_level_8: string | null;
  stat_value_level_9: string | null;
  stat_value_level_10: string | null;
  label: string | null;
};

type GameplayWeaponBonusRow = {
  weapon_type: string;
  collection_id: string;
  star_level: number;
  damage_increase: number | null;
  stat_type: string | null;
  stat_value: number | null;
  fuse_price_id: string | null;
  fuse_item_count: number | null;
  fuse_reward_pool_id: string | null;
  dismantle_reward_pool_id: string | null;
  label: string | null;
};

type GameplayWeaponStatRow = {
  stat_type: string;
  stat_value: string;
  label: string | null;
};

type GameplayWeaponLevelRow = {
  level: number;
  xp_needed: number | null;
  nft_weapon_price_id: string | null;
  reward_pool_id: string | null;
};

type GameplayAmountRow = {
  item_id: string | null;
  amount: number | null;
};

type GameplayRewardRow = {
  reward_type: string;
  reward_id: string | null;
  amount_min: number | null;
  amount_max: number | null;
  chance: number | null;
};

type GameplayWeaponDashboardBonusRow = GameplayWeaponBonusRow & {
  image_name: string | null;
  fuse_price_id: string | null;
  fuse_reward_pool_id: string | null;
  dismantle_reward_pool_id: string | null;
};

type GameplayCharacterLevelCostRow = {
  level: number;
  required_tokens: number | null;
  nft_character_price_id: string | null;
  reward_pool_id: string | null;
};

const SORT_COLUMNS: Record<CollectionSortKey, string> = {
  identifier: "identifier",
  collection: "collection",
  name: "name",
  owner: "owner",
  rank: "rank",
  priceAmount: "price_amount",
  value: "value",
  discount: "discount",
  progress: "progress",
  rarityClass: "rarity_class",
  perk1: "perk1",
  perk2: "perk2",
  level: "level",
  characterTokens: "character_tokens",
  health: "health",
  shield: "shield",
  xp: "xp",
  wear: "wear",
  starLevel: "star_level",
  damage: "damage",
  reloadTime: "reload_time",
  ammo: "ammo",
  range: "range_value",
};

const COLLECTION_ROW_SELECT = `
  identifier, collection, type, name, url, thumbnail_url, owner, rank,
  price_currency, price_amount, value, discount, progress, rarity_class,
  perk1, perk2, level, character_tokens, health, shield, xp, wear,
  star_level, damage, reload_time, ammo, range_value
`;

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function collectionFromRow(row: CollectionSummaryRow): CollectionSummary {
  return collectionSummarySchema.parse({
    id: row.id,
    name: row.name,
    type: row.type,
    nftCount: row.nft_count,
    holderCount: row.holder_count,
    description: row.description,
    iconUrl: row.icon_url,
  });
}

function rowToNft(row: NftRow): Nft {
  const base = {
    identifier: row.identifier,
    collection: row.collection,
    name: row.name,
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
    owner: row.owner,
    rank: row.rank,
    priceCurrency: row.price_currency,
    priceAmount: row.price_amount,
    value: row.value,
    discount: row.discount,
    progress: row.progress,
    attributes: JSON.parse(row.attributes_json) as Record<
      string,
      string | number | boolean | null
    >,
  };

  if (row.type === "characters") {
    return nftSchema.parse({
      ...base,
      type: row.type,
      rarityClass: row.rarity_class,
      perk1: row.perk1,
      perk2: row.perk2,
      level: row.level,
      characterTokens: row.character_tokens,
      health: row.health,
      shield: row.shield,
      talentPointsAvailable: row.talent_points_available,
      talentPointsTotal: row.talent_points_total,
      earnRate: row.earn_rate,
    });
  }

  return nftSchema.parse({
    ...base,
    type: row.type,
    xp: row.xp,
    wear: row.wear,
    level: row.level,
    starLevel: row.star_level,
    damage: row.damage,
    reloadTime: row.reload_time,
    ammo: row.ammo,
    range: row.range_value,
  });
}

function rowToCollectionRow(row: CollectionPageRow): CollectionRow {
  return collectionRowSchema.parse({
    type: row.type,
    identifier: row.identifier,
    collection: row.collection,
    name: row.name,
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
    owner: row.owner,
    rank: row.rank,
    priceCurrency: row.price_currency,
    priceAmount: row.price_amount,
    value: row.value,
    discount: row.discount,
    progress: row.progress,
    rarityClass: row.rarity_class,
    perk1: row.perk1,
    perk2: row.perk2,
    level: row.level,
    characterTokens: row.character_tokens,
    health: row.health,
    shield: row.shield,
    xp: row.xp,
    wear: row.wear,
    starLevel: row.star_level,
    damage: row.damage,
    reloadTime: row.reload_time,
    ammo: row.ammo,
    range: row.range_value,
  });
}

function virtualSummary(
  id: string,
  type: CollectionType,
  rows: CollectionSummary[],
): CollectionSummary {
  return collectionSummarySchema.parse({
    id,
    name: type === "characters" ? "All Characters" : "All Weapons",
    type,
    nftCount: rows.reduce((total, row) => total + row.nftCount, 0),
    holderCount: rows.reduce((total, row) => total + (row.holderCount ?? 0), 0),
    description:
      type === "characters"
        ? "Browse every Cantina Royale character collection in one place."
        : "Browse every Cantina Royale weapon collection in one place.",
    iconUrl: null,
  });
}

function queryScope(
  identifier: string,
  type: CollectionType,
): { clause: string; params: Record<string, string> } {
  if (
    (type === "characters" && identifier === ALL_CHARACTERS_ID) ||
    (type === "weapons" && identifier === ALL_WEAPONS_ID)
  ) {
    return {
      clause: "type = @type",
      params: { type },
    };
  }

  return {
    clause: "collection = @identifier AND type = @type",
    params: { identifier, type },
  };
}

function rounded(value: number | null) {
  return value === null ? null : Number(value.toFixed(6));
}

function marketInsightFromRow(row: MarketInsightRow): HomeMarketInsight {
  return {
    type: row.type,
    label: row.type === "characters" ? "Characters" : "Weapons",
    total: row.total,
    listed: row.listed,
    floorPrice: rounded(row.floor_price),
    averagePrice: rounded(row.average_price),
    averageValue: rounded(row.average_value),
  };
}

function marketSegmentFromRow(row: MarketSegmentRow): HomeMarketSegment {
  return {
    label: row.label?.trim() || "Unknown",
    detail: row.detail?.trim() || "Market segment",
    total: row.total,
    listed: row.listed,
    floorPrice: rounded(row.floor_price),
    averagePrice: rounded(row.average_price),
    averageValue: rounded(row.average_value),
  };
}

function distributionFromRows(rows: DistributionRow[]): HomeDistributionItem[] {
  return rows
    .filter((row) => row.label !== null && row.label !== "")
    .map((row) => ({
      label: row.label as string,
      count: row.count,
    }));
}

function characterSpeciesFamily(species: string | null) {
  const normalized = species?.trim().toLowerCase() ?? "";

  if (normalized.includes("shark")) {
    return "Shark";
  }

  if (normalized.includes("ape")) {
    return "Ape";
  }

  return species?.trim() || "Unknown";
}

function raritySortValue(label: string) {
  const index = RARITY_LABELS.findIndex(
    (rarity) => rarity.toLowerCase() === label.toLowerCase(),
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function speciesRarityDistributionFromRows(
  rows: SpeciesRarityRow[],
): HomeSpeciesRarityDistribution[] {
  const bySpecies = new Map<string, HomeSpeciesRarityDistribution>();

  for (const row of rows) {
    if (!row.rarity || row.count <= 0) {
      continue;
    }

    const species = characterSpeciesFamily(row.species);
    const current =
      bySpecies.get(species) ??
      ({
        species,
        total: 0,
        items: [],
      } satisfies HomeSpeciesRarityDistribution);
    const existing = current.items.find((item) => item.label === row.rarity);

    current.total += row.count;
    if (existing) {
      existing.count += row.count;
    } else {
      current.items.push({ label: row.rarity, count: row.count });
    }

    bySpecies.set(species, current);
  }

  return [...bySpecies.values()]
    .map((entry) => ({
      ...entry,
      items: entry.items.sort((left, right) => {
        const rarityDifference =
          raritySortValue(left.label) - raritySortValue(right.label);
        return rarityDifference !== 0
          ? rarityDifference
          : left.label.localeCompare(right.label);
      }),
    }))
    .sort((left, right) => {
      const speciesRank = (value: string) =>
        value === "Ape" ? 0 : value === "Shark" ? 1 : 2;
      const rankDifference =
        speciesRank(left.species) - speciesRank(right.species);
      return rankDifference !== 0
        ? rankDifference
        : left.species.localeCompare(right.species);
    });
}

function weaponStarMatrixFromRows(
  rows: WeaponStarRow[],
): HomeWeaponStarMatrixRow[] {
  const byWeapon = new Map<string, HomeWeaponStarMatrixRow>();

  for (const row of rows) {
    const current =
      byWeapon.get(row.weapon) ??
      ({
        weapon: row.weapon,
        total: 0,
        stars: [],
      } satisfies HomeWeaponStarMatrixRow);

    current.total += row.count;
    current.stars.push({
      starLevel: row.star_level,
      count: row.count,
    });
    byWeapon.set(row.weapon, current);
  }

  return [...byWeapon.values()].sort((left, right) => {
    const countDifference = right.total - left.total;
    return countDifference !== 0
      ? countDifference
      : left.weapon.localeCompare(right.weapon);
  });
}

function gameplayPerkFromRow(row: GameplayPerkRow): GameplayPerk {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    minRoll: row.min_roll,
    minCoefficient: row.min_coefficient,
    maxRoll: row.max_roll,
    maxCoefficient: row.max_coefficient,
  };
}

const RARITY_LABELS = ["Bronze", "Silver", "Gold", "Epic", "Legendary"];
const RARITY_VALUES = new Map(
  RARITY_LABELS.map((label, index) => [label.toLowerCase(), index]),
);

function rarityLabelFromValue(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  return RARITY_LABELS[value] ?? String(value);
}

function characterProfileLabelFromId(characterId: string) {
  return characterId.replace(/^NFT_/, "").replaceAll("_", " ");
}

const STAT_LABEL_OVERRIDES: Record<string, string> = {
  character_skill_damage: "Skill Damage",
  weapon_ammo: "Ammo",
  weapon_damage: "Damage",
  weapon_projectile_range: "Range",
  weapon_reloadTime: "Reload time",
};

function labelFromStat(statType: string, labelKey: string | null) {
  if (labelKey && !/^Stat_|_Name$/.test(labelKey)) {
    return labelKey;
  }

  const overridden = STAT_LABEL_OVERRIDES[statType];
  if (overridden) {
    return overridden;
  }

  return statType
    .replace(/^modifier_/, "")
    .replace(/^weapon_/, "")
    .replace(/^character_skill_/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeAssetName(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function weaponLabelFromType(weaponType: string) {
  return weaponType.replace(/^WeaponType_/, "");
}

function amountFromRow(row: GameplayAmountRow): GameplayAmount | null {
  if (!row.item_id || row.amount === null) {
    return null;
  }

  return {
    itemId: row.item_id,
    amount: row.amount,
  };
}

function rewardFromRow(row: GameplayRewardRow): GameplayReward {
  return {
    rewardType: row.reward_type,
    rewardId: row.reward_id,
    amountMin: row.amount_min,
    amountMax: row.amount_max,
    chance: row.chance,
  };
}

function characterProfileFromRow(
  row: GameplayCharacterProfileRow,
): GameplayCharacterProfile {
  return {
    id: row.id,
    rarity:
      row.rarity === null
        ? "-"
        : (RARITY_LABELS[row.rarity] ?? String(row.rarity)),
    species: row.species,
    raceId: row.race_id,
    roleId: row.role_id,
    speed: row.speed,
    talentId: row.talent_id,
    skillId: row.skill_id,
    totalSupply: row.total_supply,
    nftTokenId: row.nft_token_id,
  };
}

function characterLevelFromRow(
  row: GameplayCharacterLevelRow | undefined,
): GameplayCharacterLevel | null {
  if (!row) {
    return null;
  }

  return {
    level: row.level,
    health: row.health,
    shield: row.shield,
    talentPoints: row.talent_points,
    skillLevel: row.skill_level,
    crownEarnRate: row.crown_earn_rate,
  };
}

function skillValue(row: GameplayCharacterSkillRow, skillLevel: number | null) {
  if (skillLevel === null || skillLevel < 1 || skillLevel > 10) {
    return null;
  }

  return row[
    `stat_value_level_${skillLevel}` as keyof GameplayCharacterSkillRow
  ] as string | null;
}

function weaponBonusFromRow(
  row: GameplayWeaponBonusRow,
): GameplayWeaponStarBonus {
  return {
    starLevel: row.star_level,
    damageIncrease: row.damage_increase,
    statType: row.stat_type,
    statLabel: row.stat_type ? labelFromStat(row.stat_type, row.label) : null,
    statValue: row.stat_value,
    fuseItemCount: row.fuse_item_count,
  };
}

export class SqliteCantinaRepository implements CantinaRepository {
  private readonly db: Database.Database;

  constructor(databasePath = DEFAULT_DATABASE_PATH) {
    if (!existsSync(databasePath)) {
      throw new Error(
        `Cantina SQLite database not found at ${databasePath}. Run npm run data:build-db before starting the app.`,
      );
    }

    this.db = new Database(databasePath, {
      readonly: true,
      fileMustExist: true,
    });
  }

  close() {
    this.db.close();
  }

  listCollections() {
    return this.db
      .prepare(
        "SELECT id, name, type, nft_count, holder_count, description, icon_url FROM collections ORDER BY type, name",
      )
      .all()
      .map((row) => collectionFromRow(row as CollectionSummaryRow));
  }

  getCollectionGroups(): CollectionGroups {
    const collections = this.listCollections();
    const characters = collections.filter((row) => row.type === "characters");
    const weapons = collections.filter((row) => row.type === "weapons");

    return {
      characters,
      weapons,
      allCharacters: virtualSummary(
        ALL_CHARACTERS_ID,
        "characters",
        characters,
      ),
      allWeapons: virtualSummary(ALL_WEAPONS_ID, "weapons", weapons),
    };
  }

  getCollectionSummary(identifier: string) {
    const groups = this.getCollectionGroups();
    if (identifier === ALL_CHARACTERS_ID) {
      return groups.allCharacters;
    }
    if (identifier === ALL_WEAPONS_ID) {
      return groups.allWeapons;
    }

    const row = this.db
      .prepare(
        "SELECT id, name, type, nft_count, holder_count, description, icon_url FROM collections WHERE id = ?",
      )
      .get(identifier);

    return row ? collectionFromRow(row as CollectionSummaryRow) : null;
  }

  getCollectionType(identifier: string) {
    if (identifier === ALL_CHARACTERS_ID) {
      return "characters";
    }
    if (identifier === ALL_WEAPONS_ID) {
      return "weapons";
    }

    const row = this.db
      .prepare("SELECT type FROM collections WHERE id = ?")
      .get(identifier) as { type: CollectionType } | undefined;

    return row?.type ?? null;
  }

  getHomeStats(): HomeStats {
    const row = this.db
      .prepare(
        `
        SELECT
          COUNT(*) AS total_nfts,
          SUM(CASE WHEN price_amount IS NOT NULL THEN 1 ELSE 0 END) AS listed_nfts,
          SUM(CASE WHEN type = 'characters' THEN 1 ELSE 0 END) AS character_count,
          SUM(CASE WHEN type = 'weapons' THEN 1 ELSE 0 END) AS weapon_count,
          (SELECT COUNT(*) FROM collections) AS total_collections
        FROM nfts
      `,
      )
      .get() as StatRow;

    return {
      totalNfts: row.total_nfts,
      listedNfts: row.listed_nfts,
      characterCount: row.character_count,
      weaponCount: row.weapon_count,
      totalCollections: row.total_collections,
    };
  }

  getHomeInsights(): HomeInsights {
    const market = this.db
      .prepare(
        `
        SELECT
          type,
          COUNT(*) AS total,
          SUM(CASE WHEN price_amount IS NOT NULL THEN 1 ELSE 0 END) AS listed,
          MIN(price_amount) AS floor_price,
          AVG(price_amount) AS average_price,
          AVG(value) AS average_value
        FROM nfts
        GROUP BY type
        ORDER BY CASE type WHEN 'characters' THEN 0 ELSE 1 END
      `,
      )
      .all()
      .map((row) => marketInsightFromRow(row as MarketInsightRow));

    const characterMarket = this.db
      .prepare(
        `
        SELECT
          species || ' ' || rarity AS label,
          species || ' / ' || rarity AS detail,
          COUNT(*) AS total,
          SUM(CASE WHEN price_amount IS NOT NULL THEN 1 ELSE 0 END) AS listed,
          MIN(price_amount) AS floor_price,
          AVG(price_amount) AS average_price,
          AVG(value) AS average_value
        FROM (
          SELECT
            CASE
              WHEN lower(COALESCE(json_extract(attributes_json, '$.species'), '')) LIKE '%ape%' THEN 'Ape'
              WHEN lower(COALESCE(json_extract(attributes_json, '$.species'), '')) LIKE '%shark%' THEN 'Shark'
              ELSE COALESCE(NULLIF(json_extract(attributes_json, '$.species'), ''), 'Unknown')
            END AS species,
            COALESCE(NULLIF(rarity_class, ''), 'Unknown') AS rarity,
            price_amount,
            value
          FROM nfts
          WHERE type = 'characters'
        )
        GROUP BY species, rarity
        ORDER BY total DESC, listed DESC, species COLLATE NOCASE ASC, rarity COLLATE NOCASE ASC
        LIMIT 8
      `,
      )
      .all()
      .map((row) => marketSegmentFromRow(row as MarketSegmentRow));

    const weaponMarket = this.db
      .prepare(
        `
        SELECT
          name AS label,
          'Weapon family' AS detail,
          COUNT(*) AS total,
          SUM(CASE WHEN price_amount IS NOT NULL THEN 1 ELSE 0 END) AS listed,
          MIN(price_amount) AS floor_price,
          AVG(price_amount) AS average_price,
          AVG(value) AS average_value
        FROM nfts
        WHERE type = 'weapons' AND name IS NOT NULL AND name != ''
        GROUP BY name
        ORDER BY total DESC, listed DESC, name COLLATE NOCASE ASC
        LIMIT 8
      `,
      )
      .all()
      .map((row) => marketSegmentFromRow(row as MarketSegmentRow));

    const characterRarityBySpecies = speciesRarityDistributionFromRows(
      this.db
        .prepare(
          `
          SELECT
            json_extract(attributes_json, '$.species') AS species,
            rarity_class AS rarity,
            COUNT(*) AS count
          FROM nfts
          WHERE
            type = 'characters'
            AND rarity_class IS NOT NULL
            AND rarity_class != ''
          GROUP BY species, rarity_class
          ORDER BY species COLLATE NOCASE ASC, rarity_class COLLATE NOCASE ASC
        `,
        )
        .all() as SpeciesRarityRow[],
    );

    const weaponFamilies = distributionFromRows(
      this.db
        .prepare(
          `
          SELECT name AS label, COUNT(*) AS count
          FROM nfts
          WHERE type = 'weapons' AND name IS NOT NULL AND name != ''
          GROUP BY name
          ORDER BY count DESC, name COLLATE NOCASE ASC
          LIMIT 8
        `,
        )
        .all() as DistributionRow[],
    );

    const weaponStarMatrix = weaponStarMatrixFromRows(
      this.db
        .prepare(
          `
          SELECT name AS weapon, star_level, COUNT(*) AS count
          FROM nfts
          WHERE
            type = 'weapons'
            AND name IS NOT NULL
            AND name != ''
            AND star_level IS NOT NULL
          GROUP BY name, star_level
          ORDER BY name COLLATE NOCASE ASC, star_level ASC
        `,
        )
        .all() as WeaponStarRow[],
    );

    const perkDistribution = distributionFromRows(
      this.db
        .prepare(
          `
          SELECT label, COUNT(*) AS count
          FROM (
            SELECT perk1 AS label FROM nfts
            WHERE type = 'characters' AND perk1 IS NOT NULL AND perk1 != ''
            UNION ALL
            SELECT perk2 AS label FROM nfts
            WHERE type = 'characters' AND perk2 IS NOT NULL AND perk2 != ''
          )
          GROUP BY label
          ORDER BY count DESC, label COLLATE NOCASE ASC
        `,
        )
        .all() as DistributionRow[],
    );

    const starDistribution = distributionFromRows(
      this.db
        .prepare(
          `
          SELECT
            star_level || ' ' ||
              CASE WHEN star_level = 1 THEN 'star' ELSE 'stars' END AS label,
            COUNT(*) AS count
          FROM nfts
          WHERE type = 'weapons' AND star_level IS NOT NULL
          GROUP BY star_level
          ORDER BY star_level ASC
        `,
        )
        .all() as DistributionRow[],
    );

    return {
      market,
      characterMarket,
      weaponMarket,
      characterRarityBySpecies,
      weaponFamilies,
      weaponStarMatrix,
      perkDistribution,
      starDistribution,
    };
  }

  getGameplaySummary() {
    return summarizeGameplayData(this.db);
  }

  private getGameplayPerks(names: string[]) {
    const uniqueNames = [...new Set(names.filter(Boolean))];
    if (uniqueNames.length === 0) {
      return [];
    }

    const placeholders = uniqueNames.map(() => "?").join(", ");
    const rows = this.db
      .prepare(
        `
        SELECT
          id, name, description, min_roll, min_coefficient, max_roll,
          max_coefficient
        FROM gameplay_perks
        WHERE id IN (${placeholders}) OR name IN (${placeholders})
      `,
      )
      .all(...uniqueNames, ...uniqueNames)
      .map((row) => gameplayPerkFromRow(row as GameplayPerkRow));
    const byName = new Map(
      rows.flatMap((perk) => [
        [perk.id, perk],
        [perk.name, perk],
      ]),
    );

    return uniqueNames
      .map((name) => byName.get(name))
      .filter((perk): perk is GameplayPerk => perk !== undefined);
  }

  private listGameplayPerks() {
    return (
      this.db
        .prepare(
          `
          SELECT
            id, name, description, min_roll, min_coefficient, max_roll,
            max_coefficient
          FROM gameplay_perks
          ORDER BY name COLLATE NOCASE ASC, id COLLATE NOCASE ASC
        `,
        )
        .all() as GameplayPerkRow[]
    ).map(gameplayPerkFromRow);
  }

  private gameplayDistribution(sql: string): HomeDistributionItem[] {
    return distributionFromRows(
      this.db.prepare(sql).all() as DistributionRow[],
    );
  }

  private getGameplayAmounts(
    priceId: string | null | undefined,
  ): GameplayAmount[] {
    if (!priceId) {
      return [];
    }

    return (
      this.db
        .prepare(
          `
          SELECT item_id, amount
          FROM gameplay_price_pool
          WHERE id = ?
          ORDER BY row_index ASC
        `,
        )
        .all(priceId) as GameplayAmountRow[]
    )
      .map(amountFromRow)
      .filter((amount): amount is GameplayAmount => amount !== null);
  }

  private getGameplayRewards(
    rewardPoolId: string | null | undefined,
  ): GameplayReward[] {
    if (!rewardPoolId) {
      return [];
    }

    return (
      this.db
        .prepare(
          `
          SELECT reward_type, reward_id, amount_min, amount_max, chance
          FROM gameplay_reward_pool
          WHERE id = ?
          ORDER BY row_index ASC
        `,
        )
        .all(rewardPoolId) as GameplayRewardRow[]
    ).map(rewardFromRow);
  }

  getCharacterGameplayDashboard(): CharacterGameplayDashboard {
    const levelCosts = (
      this.db
        .prepare(
          `
          SELECT level, required_tokens, nft_character_price_id, reward_pool_id
          FROM gameplay_character_level_upgrades
          ORDER BY level ASC
        `,
        )
        .all() as GameplayCharacterLevelCostRow[]
    ).map(
      (row): GameplayLevelCost => ({
        level: row.level,
        requiredTokens: row.required_tokens,
        price: this.getGameplayAmounts(row.nft_character_price_id),
        rewards: this.getGameplayRewards(row.reward_pool_id),
      }),
    );

    const levelProgression = (
      this.db
        .prepare(
          `
          SELECT
            level,
            AVG(health) AS average_health,
            AVG(shield) AS average_shield,
            AVG(talent_points) AS talent_points,
            AVG(skill_level) AS skill_level,
            AVG(crown_earn_rate) AS crown_earn_rate
          FROM gameplay_character_levels
          WHERE character_id IN (
            SELECT DISTINCT id
            FROM gameplay_character_profiles
            WHERE is_nft = 1
          )
          GROUP BY level
          ORDER BY level ASC
        `,
        )
        .all() as {
        level: number;
        average_health: number | null;
        average_shield: number | null;
        talent_points: number | null;
        skill_level: number | null;
        crown_earn_rate: number | null;
      }[]
    ).map(
      (row): CharacterLevelProgression => ({
        level: row.level,
        averageHealth: row.average_health,
        averageShield: row.average_shield,
        talentPoints: row.talent_points,
        skillLevel: row.skill_level,
        crownEarnRate: row.crown_earn_rate,
      }),
    );

    const progressionRows = this.db
      .prepare(
        `
        SELECT
          levels.character_id,
          GROUP_CONCAT(DISTINCT profiles.species) AS species,
          MIN(profiles.rarity) AS rarity,
          levels.level,
          levels.health,
          levels.shield,
          levels.talent_points,
          levels.skill_level,
          levels.crown_earn_rate
        FROM gameplay_character_levels levels
        INNER JOIN gameplay_character_profiles profiles
          ON profiles.id = levels.character_id
          AND profiles.is_nft = 1
        GROUP BY levels.character_id, levels.level
        ORDER BY levels.character_id COLLATE NOCASE ASC, levels.level ASC
      `,
      )
      .all() as GameplayCharacterProgressionRow[];
    const progressionByProfile = new Map<string, CharacterProfileProgression>();
    for (const row of progressionRows) {
      const rarity = rarityLabelFromValue(row.rarity);
      const current =
        progressionByProfile.get(row.character_id) ??
        ({
          key: row.character_id,
          label: characterProfileLabelFromId(row.character_id),
          species: (row.species ?? "").split(",").join(", "),
          rarity,
          levels: [],
        } satisfies CharacterProfileProgression);
      current.levels.push({
        level: row.level,
        health: row.health,
        shield: row.shield,
        talentPoints: row.talent_points,
        skillLevel: row.skill_level,
        crownEarnRate: row.crown_earn_rate,
      });
      progressionByProfile.set(row.character_id, current);
    }
    const profileProgression = [...progressionByProfile.values()];

    const statProfiles = (
      this.db
        .prepare(
          `
          SELECT
            profiles.row_index,
            profiles.id,
            profiles.species,
            profiles.rarity,
            profiles.speed,
            levels.health,
            levels.shield,
            levels.talent_points,
            levels.skill_level,
            levels.crown_earn_rate
          FROM gameplay_character_profiles profiles
          LEFT JOIN (
            SELECT character_id, MAX(level) AS max_level
            FROM gameplay_character_levels
            GROUP BY character_id
          ) max_levels
            ON max_levels.character_id = profiles.id
          LEFT JOIN gameplay_character_levels levels
            ON levels.character_id = profiles.id
            AND levels.level = max_levels.max_level
          WHERE profiles.is_nft = 1
          ORDER BY profiles.species COLLATE NOCASE ASC, profiles.rarity ASC
        `,
        )
        .all() as GameplayCharacterStatProfileRow[]
    ).map((row): GameplayStatProfile => {
      const rarity = rarityLabelFromValue(row.rarity);

      return {
        key: `profile-${row.row_index}`,
        label: `${row.species} ${rarity}`,
        species: row.species,
        rarity,
        stats: [
          { label: "Health", value: row.health },
          { label: "Shield", value: row.shield },
          { label: "Speed", value: row.speed },
          { label: "Earn rate", value: row.crown_earn_rate },
          { label: "Talent", value: row.talent_points },
          { label: "Skill", value: row.skill_level },
        ],
      };
    });

    return {
      perks: this.listGameplayPerks(),
      rarityProfiles: this.gameplayDistribution(`
        SELECT
          CASE rarity
            WHEN 0 THEN 'Bronze'
            WHEN 1 THEN 'Silver'
            WHEN 2 THEN 'Gold'
            WHEN 3 THEN 'Epic'
            WHEN 4 THEN 'Legendary'
            ELSE CAST(rarity AS TEXT)
          END AS label,
          COUNT(*) AS count
        FROM gameplay_character_profiles
        WHERE is_nft = 1
        GROUP BY rarity
        ORDER BY rarity ASC
      `),
      speciesProfiles: this.gameplayDistribution(`
        SELECT species AS label, COUNT(*) AS count
        FROM gameplay_character_profiles
        WHERE is_nft = 1
        GROUP BY species
        ORDER BY count DESC, species COLLATE NOCASE ASC
      `),
      levelProgression,
      profileProgression,
      statProfiles,
      levelCosts,
    };
  }

  getWeaponGameplayDashboard(): WeaponGameplayDashboard {
    const starBonuses = (
      this.db
        .prepare(
          `
          SELECT
            bonuses.weapon_type,
            bonuses.collection_id,
            bonuses.star_level,
            bonuses.damage_increase,
            bonuses.stat_type,
            bonuses.stat_value,
            bonuses.fuse_price_id,
            bonuses.fuse_item_count,
            bonuses.fuse_reward_pool_id,
            bonuses.dismantle_reward_pool_id,
            bonuses.image_name,
            dictionary.name_key AS label
          FROM gameplay_weapon_star_bonuses bonuses
          LEFT JOIN gameplay_stats_dictionary dictionary
            ON dictionary.stat_id = bonuses.stat_type
          WHERE bonuses.is_nft = 1
          ORDER BY bonuses.collection_id COLLATE NOCASE ASC,
            bonuses.weapon_type COLLATE NOCASE ASC,
            bonuses.star_level ASC
        `,
        )
        .all() as GameplayWeaponDashboardBonusRow[]
    ).map((row) => ({
      weapon: weaponLabelFromType(row.weapon_type),
      collectionId: row.collection_id,
      starLevel: row.star_level,
      damageIncrease: row.damage_increase,
      statLabel: row.stat_type ? labelFromStat(row.stat_type, row.label) : null,
      statValue: row.stat_value,
      fusePrice: this.getGameplayAmounts(row.fuse_price_id),
      fuseRewards: this.getGameplayRewards(row.fuse_reward_pool_id),
      dismantleRewards: this.getGameplayRewards(row.dismantle_reward_pool_id),
    }));

    const baseStatRows = this.db
      .prepare(
        `
        SELECT stats.weapon_type, stats.stat_type, stats.stat_value,
          dictionary.name_key AS label
        FROM gameplay_weapon_stats stats
        LEFT JOIN gameplay_stats_dictionary dictionary
          ON dictionary.stat_id = stats.stat_type
        WHERE stats.visible_on_ui = 1
        ORDER BY stats.weapon_type COLLATE NOCASE ASC,
          CASE stats.stat_type
            WHEN 'weapon_damage' THEN 0
            WHEN 'weapon_reloadTime' THEN 1
            WHEN 'weapon_ammo' THEN 2
            WHEN 'weapon_projectile_range' THEN 3
            ELSE 4
          END,
          stats.stat_type COLLATE NOCASE ASC
      `,
      )
      .all() as (GameplayWeaponStatRow & { weapon_type: string })[];
    const baseStats = new Map<
      string,
      { weapon: string; stats: { label: string; value: string }[] }
    >();
    for (const row of baseStatRows) {
      const weapon = weaponLabelFromType(row.weapon_type);
      const current =
        baseStats.get(row.weapon_type) ??
        ({
          weapon,
          stats: [],
        } satisfies {
          weapon: string;
          stats: { label: string; value: string }[];
        });
      current.stats.push({
        label: labelFromStat(row.stat_type, row.label),
        value: row.stat_value,
      });
      baseStats.set(row.weapon_type, current);
    }

    const levelCosts = (
      this.db
        .prepare(
          `
          SELECT level, xp_needed, nft_weapon_price_id, reward_pool_id
          FROM gameplay_weapon_level_upgrades
          ORDER BY level ASC
        `,
        )
        .all() as GameplayWeaponLevelRow[]
    ).map(
      (row): GameplayLevelCost => ({
        level: row.level,
        xpNeeded: row.xp_needed,
        price: this.getGameplayAmounts(row.nft_weapon_price_id),
        rewards: this.getGameplayRewards(row.reward_pool_id),
      }),
    );

    return {
      weaponCollections: this.gameplayDistribution(`
        SELECT collection_id AS label, COUNT(*) AS count
        FROM gameplay_weapon_star_bonuses
        WHERE is_nft = 1
        GROUP BY collection_id
        ORDER BY count DESC, collection_id COLLATE NOCASE ASC
      `),
      starDistribution: this.gameplayDistribution(`
        SELECT
          star_level || ' ' ||
            CASE WHEN star_level = 1 THEN 'star' ELSE 'stars' END AS label,
          COUNT(*) AS count
        FROM gameplay_weapon_star_bonuses
        WHERE is_nft = 1
        GROUP BY star_level
        ORDER BY star_level ASC
      `),
      starBonuses,
      baseStats: [...baseStats.values()],
      levelCosts,
    };
  }

  getEconomyGameplayDashboard(): EconomyGameplayDashboard {
    const upgradeCosts: GameplayEconomyCost[] = [];
    const currencyUsage = new Map<string, GameplayCurrencyUsage>();
    const addCurrencyUsage = (price: GameplayAmount[]) => {
      for (const amount of price) {
        if (amount.amount <= 0) {
          continue;
        }
        const current =
          currencyUsage.get(amount.itemId) ??
          ({
            itemId: amount.itemId,
            totalAmount: 0,
            uses: 0,
          } satisfies GameplayCurrencyUsage);
        current.totalAmount += amount.amount;
        current.uses += 1;
        currencyUsage.set(amount.itemId, current);
      }
    };
    const addCost = (cost: GameplayEconomyCost) => {
      if (!cost.price.some((amount) => amount.amount > 0)) {
        return;
      }
      addCurrencyUsage(cost.price);
      upgradeCosts.push(cost);
    };

    const characterRows = this.db
      .prepare(
        `
        SELECT level, required_tokens, nft_character_price_id, reward_pool_id
        FROM gameplay_character_level_upgrades
        ORDER BY level ASC
      `,
      )
      .all() as GameplayCharacterLevelCostRow[];
    for (const row of characterRows) {
      addCost({
        category: "Character upgrade",
        label: `Level ${row.level}`,
        requirement:
          row.required_tokens === null
            ? null
            : `${row.required_tokens.toLocaleString("en")} character tokens`,
        price: this.getGameplayAmounts(row.nft_character_price_id),
        rewards: this.getGameplayRewards(row.reward_pool_id),
      });
    }

    const weaponRows = this.db
      .prepare(
        `
        SELECT level, xp_needed, nft_weapon_price_id, reward_pool_id
        FROM gameplay_weapon_level_upgrades
        ORDER BY level ASC
      `,
      )
      .all() as GameplayWeaponLevelRow[];
    for (const row of weaponRows) {
      addCost({
        category: "Weapon upgrade",
        label: `Level ${row.level}`,
        requirement:
          row.xp_needed === null
            ? null
            : `${row.xp_needed.toLocaleString("en")} XP`,
        price: this.getGameplayAmounts(row.nft_weapon_price_id),
        rewards: this.getGameplayRewards(row.reward_pool_id),
      });
    }

    const fuseRows = this.db
      .prepare(
        `
        SELECT
          weapon_type,
          star_level,
          fuse_item_count,
          fuse_price_id,
          fuse_reward_pool_id,
          dismantle_reward_pool_id
        FROM gameplay_weapon_star_bonuses
        WHERE is_nft = 1
        ORDER BY star_level ASC, weapon_type COLLATE NOCASE ASC
      `,
      )
      .all() as {
      weapon_type: string;
      star_level: number;
      fuse_item_count: number | null;
      fuse_price_id: string | null;
      fuse_reward_pool_id: string | null;
      dismantle_reward_pool_id: string | null;
    }[];
    for (const row of fuseRows) {
      addCost({
        category: "Weapon fuse",
        label: `${weaponLabelFromType(row.weapon_type)} star ${row.star_level}`,
        requirement:
          row.fuse_item_count === null
            ? null
            : `${row.fuse_item_count.toLocaleString("en")} matching weapons`,
        price: this.getGameplayAmounts(row.fuse_price_id),
        rewards: [
          ...this.getGameplayRewards(row.fuse_reward_pool_id),
          ...this.getGameplayRewards(row.dismantle_reward_pool_id),
        ],
      });
    }

    const sortedCurrencyUsage = [...currencyUsage.values()].sort(
      (left, right) =>
        right.totalAmount - left.totalAmount ||
        left.itemId.localeCompare(right.itemId),
    );
    return {
      currencyUsage: sortedCurrencyUsage,
      upgradeCosts,
    };
  }

  private getCharacterProfile(
    nft: Extract<Nft, { type: "characters" }>,
  ): GameplayCharacterProfileRow | undefined {
    const species =
      typeof nft.attributes.species === "string"
        ? nft.attributes.species
        : null;
    const rarity =
      typeof nft.rarityClass === "string"
        ? RARITY_VALUES.get(nft.rarityClass.toLowerCase())
        : undefined;

    if (!species || rarity === undefined) {
      return undefined;
    }

    return this.db
      .prepare(
        `
        SELECT
          id, rarity, species, race_id, role_id, speed, talent_id, skill_id,
          total_supply, nft_token_id
        FROM gameplay_character_profiles
        WHERE species = @species AND rarity = @rarity AND is_nft = 1
        ORDER BY
          CASE WHEN nft_token_id = @collection THEN 0 ELSE 1 END,
          row_index ASC
        LIMIT 1
      `,
      )
      .get({
        species,
        rarity,
        collection: nft.collection,
      }) as GameplayCharacterProfileRow | undefined;
  }

  private getCharacterLevel(
    characterId: string,
    level: number | null | undefined,
  ) {
    if (level === null || level === undefined) {
      return undefined;
    }

    return this.db
      .prepare(
        `
        SELECT level, health, shield, talent_points, skill_level, crown_earn_rate
        FROM gameplay_character_levels
        WHERE character_id = @characterId AND level = @level
      `,
      )
      .get({ characterId, level }) as GameplayCharacterLevelRow | undefined;
  }

  private getCharacterMaxLevel(characterId: string) {
    return this.db
      .prepare(
        `
        SELECT level, health, shield, talent_points, skill_level, crown_earn_rate
        FROM gameplay_character_levels
        WHERE character_id = @characterId
        ORDER BY level DESC
        LIMIT 1
      `,
      )
      .get({ characterId }) as GameplayCharacterLevelRow | undefined;
  }

  private getCharacterUpgrade(level: number | null | undefined) {
    if (level === null || level === undefined) {
      return null;
    }

    const row = this.db
      .prepare(
        `
        SELECT level, nft_character_price_id, required_tokens, reward_pool_id
        FROM gameplay_character_level_upgrades
        WHERE level = ?
      `,
      )
      .get(level) as GameplayCharacterUpgradeRow | undefined;

    if (!row) {
      return null;
    }

    return {
      level: row.level,
      requiredTokens: row.required_tokens,
      price: this.getGameplayAmounts(row.nft_character_price_id),
      rewards: this.getGameplayRewards(row.reward_pool_id),
    };
  }

  private getCharacterSkillStats(
    characterId: string,
    currentSkillLevel: number | null,
    nextSkillLevel: number | null,
  ): GameplayCharacterSkillStat[] {
    return (
      this.db
        .prepare(
          `
          SELECT
            stats.stat_type,
            stats.stat_value_level_1,
            stats.stat_value_level_2,
            stats.stat_value_level_3,
            stats.stat_value_level_4,
            stats.stat_value_level_5,
            stats.stat_value_level_6,
            stats.stat_value_level_7,
            stats.stat_value_level_8,
            stats.stat_value_level_9,
            stats.stat_value_level_10,
            dictionary.name_key AS label
          FROM gameplay_character_skill_stats stats
          LEFT JOIN gameplay_stats_dictionary dictionary
            ON dictionary.stat_id = stats.stat_type
          WHERE stats.character_id = @characterId
            AND COALESCE(stats.visible_on_ui, 0) = 1
          ORDER BY stats.stat_type COLLATE NOCASE ASC
        `,
        )
        .all({ characterId }) as GameplayCharacterSkillRow[]
    ).map((row) => ({
      statType: row.stat_type,
      label: labelFromStat(row.stat_type, row.label),
      currentValue: skillValue(row, currentSkillLevel),
      nextValue: skillValue(row, nextSkillLevel),
    }));
  }

  private getCharacterGameplay(
    nft: Extract<Nft, { type: "characters" }>,
  ): GameplayCharacterDetail {
    const profileRow = this.getCharacterProfile(nft);
    if (!profileRow) {
      return {
        profile: null,
        currentLevel: null,
        nextLevel: null,
        maxLevel: null,
        nextUpgrade: null,
        skillStats: [],
      };
    }

    const currentLevelRow = this.getCharacterLevel(profileRow.id, nft.level);
    const currentLevel = characterLevelFromRow(currentLevelRow);
    const nextLevelRow = this.getCharacterLevel(
      profileRow.id,
      nft.level === null ? null : nft.level + 1,
    );
    const nextLevel = characterLevelFromRow(nextLevelRow);
    const maxLevel = characterLevelFromRow(
      this.getCharacterMaxLevel(profileRow.id),
    );

    return {
      profile: characterProfileFromRow(profileRow),
      currentLevel,
      nextLevel,
      maxLevel,
      nextUpgrade: this.getCharacterUpgrade(nextLevel?.level),
      skillStats: this.getCharacterSkillStats(
        profileRow.id,
        currentLevel?.skillLevel ?? null,
        nextLevel?.skillLevel ?? null,
      ),
    };
  }

  private getWeaponBonusRows(
    nft: Extract<Nft, { type: "weapons" }>,
  ): GameplayWeaponBonusRow[] {
    const targetName = normalizeAssetName(nft.name);
    const rows = this.db
      .prepare(
        `
        SELECT
          bonuses.weapon_type,
          bonuses.collection_id,
          bonuses.star_level,
          bonuses.damage_increase,
          bonuses.stat_type,
          bonuses.stat_value,
          bonuses.fuse_price_id,
          bonuses.fuse_item_count,
          bonuses.fuse_reward_pool_id,
          bonuses.dismantle_reward_pool_id,
          dictionary.name_key AS label,
          bonuses.image_name,
          bonuses.nft_name
        FROM gameplay_weapon_star_bonuses bonuses
        LEFT JOIN gameplay_stats_dictionary dictionary
          ON dictionary.stat_id = bonuses.stat_type
        WHERE bonuses.is_nft = 1
          AND (bonuses.token_id = @collection OR bonuses.token_id IS NULL)
        ORDER BY bonuses.star_level ASC
      `,
      )
      .all({ collection: nft.collection }) as (GameplayWeaponBonusRow & {
      image_name: string | null;
      nft_name: string | null;
    })[];

    return rows.filter(
      (row) =>
        normalizeAssetName(row.image_name) === targetName ||
        normalizeAssetName(row.nft_name) === targetName,
    );
  }

  private getWeaponBaseStats(weaponType: string) {
    return (
      this.db
        .prepare(
          `
          SELECT stats.stat_type, stats.stat_value, dictionary.name_key AS label
          FROM gameplay_weapon_stats stats
          LEFT JOIN gameplay_stats_dictionary dictionary
            ON dictionary.stat_id = stats.stat_type
          WHERE stats.weapon_type = @weaponType
            AND stats.visible_on_ui = 1
          ORDER BY
            CASE stats.stat_type
              WHEN 'weapon_damage' THEN 0
              WHEN 'weapon_reloadTime' THEN 1
              WHEN 'weapon_ammo' THEN 2
              WHEN 'weapon_projectile_range' THEN 3
              ELSE 4
            END,
            stats.stat_type COLLATE NOCASE ASC
        `,
        )
        .all({ weaponType }) as GameplayWeaponStatRow[]
    ).map((row) => ({
      statType: row.stat_type,
      label: labelFromStat(row.stat_type, row.label),
      value: row.stat_value,
    }));
  }

  private getWeaponNextLevel(
    level: number | null | undefined,
  ): GameplayWeaponLevel | null {
    if (level === null || level === undefined) {
      return null;
    }

    const row = this.db
      .prepare(
        `
        SELECT level, xp_needed, nft_weapon_price_id, reward_pool_id
        FROM gameplay_weapon_level_upgrades
        WHERE level = ?
      `,
      )
      .get(level + 1) as GameplayWeaponLevelRow | undefined;

    if (!row) {
      return null;
    }

    return {
      level: row.level,
      xpNeeded: row.xp_needed,
      price: this.getGameplayAmounts(row.nft_weapon_price_id),
      rewards: this.getGameplayRewards(row.reward_pool_id),
    };
  }

  private getWeaponGameplay(
    nft: Extract<Nft, { type: "weapons" }>,
  ): GameplayWeaponDetail | undefined {
    const rows = this.getWeaponBonusRows(nft);
    if (rows.length === 0) {
      return undefined;
    }

    const currentRow =
      rows.find((row) => row.star_level === nft.starLevel) ?? rows[0];

    return {
      weaponType: currentRow.weapon_type,
      collectionId: currentRow.collection_id,
      currentStarBonus:
        currentRow.star_level === nft.starLevel
          ? weaponBonusFromRow(currentRow)
          : null,
      allStarBonuses: rows.map(weaponBonusFromRow),
      baseStats: this.getWeaponBaseStats(currentRow.weapon_type),
      nextLevel: this.getWeaponNextLevel(nft.level),
      fusePrice: this.getGameplayAmounts(currentRow.fuse_price_id),
      fuseRewards: this.getGameplayRewards(currentRow.fuse_reward_pool_id),
      dismantleRewards: this.getGameplayRewards(
        currentRow.dismantle_reward_pool_id,
      ),
    };
  }

  getNftGameplay(identifier: string): NftGameplay | null {
    const nft = this.findNft(identifier);
    if (!nft) {
      return null;
    }

    if (nft.type === "characters") {
      return {
        perks: this.getGameplayPerks([nft.perk1 ?? "", nft.perk2 ?? ""]),
        character: this.getCharacterGameplay(nft),
      };
    }

    return {
      perks: [],
      weapon: this.getWeaponGameplay(nft),
    };
  }

  getCollectionPage(query: CollectionQuery) {
    const scope = queryScope(query.identifier, query.type);
    const where = [scope.clause];
    const params: Record<string, string | number | null> = { ...scope.params };

    if (query.search) {
      where.push("search_text LIKE @search ESCAPE '\\'");
      params.search = `%${escapeLike(query.search.toLowerCase())}%`;
    }
    if (query.listing === "listed") {
      where.push("price_amount IS NOT NULL");
    }
    if (query.listing === "unlisted") {
      where.push("price_amount IS NULL");
    }
    if (query.collection) {
      where.push("collection = @collection");
      params.collection = query.collection;
    }
    if (query.rarityClass) {
      where.push("rarity_class = @rarityClass");
      params.rarityClass = query.rarityClass;
    }
    if (query.priceCurrency) {
      where.push("price_currency = @priceCurrency");
      params.priceCurrency = query.priceCurrency;
    }
    if (query.name) {
      where.push("name = @name");
      params.name = query.name;
    }
    if (query.perk) {
      where.push("(perk1 = @perk OR perk2 = @perk)");
      params.perk = query.perk;
    }
    if (query.level !== undefined) {
      where.push("level = @level");
      params.level = query.level;
    }
    if (query.starLevel !== undefined) {
      where.push("star_level = @starLevel");
      params.starLevel = query.starLevel;
    }
    if (query.minPrice !== undefined) {
      where.push("price_amount >= @minPrice");
      params.minPrice = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      where.push("price_amount <= @maxPrice");
      params.maxPrice = query.maxPrice;
    }
    if (query.minRank !== undefined) {
      where.push("rank >= @minRank");
      params.minRank = query.minRank;
    }
    if (query.maxRank !== undefined) {
      where.push("rank <= @maxRank");
      params.maxRank = query.maxRank;
    }
    if (query.minValue !== undefined) {
      where.push("value >= @minValue");
      params.minValue = query.minValue;
    }
    if (query.maxValue !== undefined) {
      where.push("value <= @maxValue");
      params.maxValue = query.maxValue;
    }
    if (query.minProgress !== undefined) {
      where.push("progress >= @minProgress");
      params.minProgress = query.minProgress;
    }
    if (query.maxProgress !== undefined) {
      where.push("progress <= @maxProgress");
      params.maxProgress = query.maxProgress;
    }

    const whereSql = where.join(" AND ");
    const totalRow = this.db
      .prepare(`SELECT COUNT(*) AS total FROM nfts WHERE ${whereSql}`)
      .get(params) as CountRow;

    const page =
      totalRow.total === 0
        ? 1
        : Math.min(query.page, Math.ceil(totalRow.total / query.pageSize));
    const sortColumn = SORT_COLUMNS[query.sortBy];
    const sortDirection: SortDirection = query.sortDirection;
    const offset = (page - 1) * query.pageSize;
    const rows = this.db
      .prepare(
        `
        SELECT ${COLLECTION_ROW_SELECT} FROM nfts
        WHERE ${whereSql}
        ORDER BY ${sortColumn} IS NULL ASC, ${sortColumn} COLLATE NOCASE ${sortDirection}, identifier ASC
        LIMIT @limit OFFSET @offset
      `,
      )
      .all({
        ...params,
        limit: query.pageSize,
        offset,
      })
      .map((row) => rowToCollectionRow(row as CollectionPageRow));

    return collectionPageSchema.parse({
      rows,
      total: totalRow.total,
      page,
      pageSize: query.pageSize,
    });
  }

  getFilterOptions(identifier: string, type: CollectionType): FilterOptions {
    const scope = queryScope(identifier, type);
    const distinct = (column: string) =>
      this.db
        .prepare(
          `
          SELECT DISTINCT ${column} AS value
          FROM nfts
          WHERE ${scope.clause} AND ${column} IS NOT NULL AND ${column} != ''
          ORDER BY ${column} COLLATE NOCASE ASC
        `,
        )
        .all(scope.params)
        .map((row) => (row as DistinctValueRow).value)
        .filter((value): value is string => value !== null);
    const distinctNumber = (column: string) =>
      this.db
        .prepare(
          `
          SELECT DISTINCT ${column} AS value
          FROM nfts
          WHERE ${scope.clause} AND ${column} IS NOT NULL
          ORDER BY ${column} ASC
        `,
        )
        .all(scope.params)
        .map((row) => (row as DistinctNumberRow).value)
        .filter((value): value is number => value !== null);

    const perks =
      type === "characters"
        ? this.db
            .prepare(
              `
              SELECT value
              FROM (
                SELECT DISTINCT perk1 AS value FROM nfts
                WHERE ${scope.clause} AND perk1 IS NOT NULL AND perk1 != ''
                UNION
                SELECT DISTINCT perk2 AS value FROM nfts
                WHERE ${scope.clause} AND perk2 IS NOT NULL AND perk2 != ''
              )
              ORDER BY value COLLATE NOCASE ASC
            `,
            )
            .all(scope.params)
            .map((row) => (row as DistinctValueRow).value)
            .filter((value): value is string => value !== null)
        : [];

    return {
      collections: distinct("collection"),
      rarityClasses: type === "characters" ? distinct("rarity_class") : [],
      priceCurrencies: distinct("price_currency"),
      names: type === "weapons" ? distinct("name") : [],
      perks,
      levels: distinctNumber("level"),
      starLevels: type === "weapons" ? distinctNumber("star_level") : [],
    };
  }

  findNft(identifier: string) {
    const row = this.db
      .prepare("SELECT * FROM nfts WHERE identifier = ?")
      .get(identifier);

    return row ? rowToNft(row as NftRow) : null;
  }

  searchNfts(search: string, limit: number): SearchResult[] {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return [];
    }

    const like = `%${escapeLike(normalizedSearch)}%`;
    return this.db
      .prepare(
        `
        SELECT identifier, collection, type, name, url, thumbnail_url
        FROM nfts
        WHERE search_text LIKE @search ESCAPE '\\'
        ORDER BY
          CASE
            WHEN lower(identifier) = @exact THEN 0
            WHEN lower(identifier) LIKE @prefix THEN 1
            WHEN lower(name) LIKE @prefix THEN 2
            ELSE 3
          END,
          identifier ASC
        LIMIT @limit
      `,
      )
      .all({
        search: like,
        exact: normalizedSearch,
        prefix: `${escapeLike(normalizedSearch)}%`,
        limit: Math.max(1, Math.min(limit, 20)),
      })
      .map((row) => {
        const result = row as {
          identifier: string;
          collection: string;
          type: CollectionType;
          name: string;
          url: string | null;
          thumbnail_url: string | null;
        };

        return searchResultSchema.parse({
          identifier: result.identifier,
          collection: result.collection,
          type: result.type,
          name: result.name,
          url: result.url,
          thumbnailUrl: result.thumbnail_url,
        });
      });
  }
}
