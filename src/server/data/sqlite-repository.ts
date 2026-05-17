import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import {
  ALL_CHARACTERS_ID,
  ALL_WEAPONS_ID,
  type CantinaRepository,
  type CollectionGroups,
  type FilterOptions,
  type HomeCollectionInsight,
  type HomeDistributionItem,
  type HomeInsights,
  type HomeMarketInsight,
  type HomeStats,
  type HomeWeaponStarMatrixRow,
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

type CollectionInsightRow = {
  id: string;
  name: string;
  type: CollectionType;
  nft_count: number;
  listed_count: number;
  floor_price: number | null;
  average_value: number | null;
};

type DistributionRow = {
  label: string | null;
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
    holderCount: rows.reduce(
      (total, row) => total + (row.holderCount ?? 0),
      0,
    ),
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

function collectionInsightFromRow(
  row: CollectionInsightRow,
): HomeCollectionInsight {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    nftCount: row.nft_count,
    listedCount: row.listed_count,
    floorPrice: rounded(row.floor_price),
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

export class SqliteCantinaRepository implements CantinaRepository {
  private readonly db: Database.Database;

  constructor(databasePath = DEFAULT_DATABASE_PATH) {
    if (!existsSync(databasePath)) {
      throw new Error(
        `Cantina SQLite database not found at ${databasePath}. Run npm run data:build-db before starting the app.`,
      );
    }

    this.db = new Database(databasePath, { readonly: true, fileMustExist: true });
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
      allCharacters: virtualSummary(ALL_CHARACTERS_ID, "characters", characters),
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

    const topCollections = this.db
      .prepare(
        `
        SELECT
          c.id,
          c.name,
          c.type,
          c.nft_count,
          SUM(CASE WHEN n.price_amount IS NOT NULL THEN 1 ELSE 0 END) AS listed_count,
          MIN(n.price_amount) AS floor_price,
          AVG(n.value) AS average_value
        FROM collections c
        LEFT JOIN nfts n ON n.collection = c.id
        GROUP BY c.id, c.name, c.type, c.nft_count
        ORDER BY c.nft_count DESC, c.name COLLATE NOCASE ASC
        LIMIT 6
      `,
      )
      .all()
      .map((row) => collectionInsightFromRow(row as CollectionInsightRow));

    const rarityDistribution = distributionFromRows(
      this.db
        .prepare(
          `
          SELECT rarity_class AS label, COUNT(*) AS count
          FROM nfts
          WHERE type = 'characters' AND rarity_class IS NOT NULL AND rarity_class != ''
          GROUP BY rarity_class
          ORDER BY count DESC, rarity_class COLLATE NOCASE ASC
        `,
        )
        .all() as DistributionRow[],
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

    const topPerks = distributionFromRows(
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
          LIMIT 8
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
      topCollections,
      rarityDistribution,
      weaponFamilies,
      weaponStarMatrix,
      topPerks,
      starDistribution,
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
