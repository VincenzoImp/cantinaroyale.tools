import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { nftSchema, type CollectionType, type Nft } from "./schema";
import { DEFAULT_DATABASE_PATH, DEFAULT_DATA_DIRECTORY } from "./paths";

type RawObject = Record<string, unknown>;

type BuildOptions = {
  dataDirectory?: string;
  outputPath?: string;
};

type AppInfo = {
  variables?: {
    collections?: {
      characters?: string[];
      weapons?: string[];
      allCharacters?: string;
      allWeapons?: string;
    };
  };
};

const COMMON_FIELDS = new Set([
  "identifier",
  "collection",
  "name",
  "url",
  "thumbnailUrl",
  "owner",
  "rank",
  "priceCurrency",
  "priceAmount",
  "value",
  "discount",
  "progress",
]);

const CHARACTER_FIELDS = new Set([
  "rarityClass",
  "perk1",
  "perk2",
  "level",
  "characterTokens",
  "health",
  "shield",
  "talentPointsAvailable",
  "talentPointsTotal",
  "earnRate",
]);

const WEAPON_FIELDS = new Set([
  "xp",
  "wear",
  "level",
  "starLevel",
  "damage",
  "reloadTime",
  "ammo",
  "range",
]);

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function integerOrNull(value: unknown): number | null {
  const numberValue = numberOrNull(value);
  return numberValue === null ? null : Math.trunc(numberValue);
}

function attributeValue(value: unknown): string | number | boolean | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }

  return JSON.stringify(value);
}

function getAttributes(raw: RawObject, type: CollectionType) {
  const excluded = new Set([
    ...COMMON_FIELDS,
    ...(type === "characters" ? CHARACTER_FIELDS : WEAPON_FIELDS),
  ]);
  const attributes: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!excluded.has(key)) {
      attributes[key] = attributeValue(value);
    }
  }

  return attributes;
}

function normalizeNft(raw: RawObject, type: CollectionType): Nft {
  const base = {
    identifier: stringOrNull(raw.identifier) ?? "",
    collection: stringOrNull(raw.collection) ?? "",
    name: stringOrNull(raw.name) ?? "Unnamed NFT",
    url: stringOrNull(raw.url),
    thumbnailUrl: stringOrNull(raw.thumbnailUrl),
    owner: stringOrNull(raw.owner),
    rank: numberOrNull(raw.rank),
    priceCurrency: stringOrNull(raw.priceCurrency),
    priceAmount: numberOrNull(raw.priceAmount),
    value: numberOrNull(raw.value),
    discount: numberOrNull(raw.discount),
    progress: numberOrNull(raw.progress),
    attributes: getAttributes(raw, type),
  };

  if (type === "characters") {
    return nftSchema.parse({
      ...base,
      type,
      rarityClass: stringOrNull(raw.rarityClass),
      perk1: stringOrNull(raw.perk1),
      perk2: stringOrNull(raw.perk2),
      level: integerOrNull(raw.level),
      characterTokens: numberOrNull(raw.characterTokens),
      health: numberOrNull(raw.health),
      shield: numberOrNull(raw.shield),
      talentPointsAvailable: numberOrNull(raw.talentPointsAvailable),
      talentPointsTotal: numberOrNull(raw.talentPointsTotal),
      earnRate: numberOrNull(raw.earnRate),
    });
  }

  return nftSchema.parse({
    ...base,
    type,
    xp: numberOrNull(raw.xp),
    wear: numberOrNull(raw.wear),
    level: integerOrNull(raw.level),
    starLevel: integerOrNull(raw.starLevel),
    damage: numberOrNull(raw.damage),
    reloadTime: numberOrNull(raw.reloadTime),
    ammo: numberOrNull(raw.ammo),
    range: numberOrNull(raw.range),
  });
}

function collectionTypeForId(appInfo: AppInfo, collectionId: string): CollectionType {
  const collections = appInfo.variables?.collections;
  if (collections?.characters?.includes(collectionId)) {
    return "characters";
  }
  if (collections?.weapons?.includes(collectionId)) {
    return "weapons";
  }

  throw new Error(`Unknown collection in public/data/info.json: ${collectionId}`);
}

function searchTextFor(nft: Nft): string {
  const attributeText = Object.values(nft.attributes)
    .filter((value) => value !== null)
    .join(" ");

  const specific =
    nft.type === "characters"
      ? [nft.rarityClass, nft.perk1, nft.perk2]
      : [nft.starLevel, nft.damage, nft.range];

  return [
    nft.identifier,
    nft.collection,
    nft.name,
    nft.owner,
    nft.priceCurrency,
    ...specific,
    attributeText,
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}

function removeSqliteFiles(databasePath: string) {
  for (const filePath of [
    databasePath,
    `${databasePath}-wal`,
    `${databasePath}-shm`,
  ]) {
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }
}

function removeSqliteSidecars(databasePath: string) {
  for (const filePath of [`${databasePath}-wal`, `${databasePath}-shm`]) {
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }
}

function stagingDatabasePath(outputPath: string) {
  return path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
}

export function buildSqliteDatabase({
  dataDirectory = DEFAULT_DATA_DIRECTORY,
  outputPath = DEFAULT_DATABASE_PATH,
}: BuildOptions = {}) {
  const appInfo = readJson<AppInfo>(path.join(dataDirectory, "info.json"));
  const collectionIds = [
    ...(appInfo.variables?.collections?.characters ?? []),
    ...(appInfo.variables?.collections?.weapons ?? []),
  ];

  mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = stagingDatabasePath(outputPath);

  const db = new Database(temporaryPath);
  db.pragma("journal_mode = DELETE");
  db.pragma("synchronous = NORMAL");

  let closed = false;

  try {
    db.exec(`
    CREATE TABLE collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('characters', 'weapons')),
      nft_count INTEGER NOT NULL,
      holder_count INTEGER,
      description TEXT,
      icon_url TEXT
    );

    CREATE TABLE nfts (
      identifier TEXT PRIMARY KEY,
      collection TEXT NOT NULL REFERENCES collections(id),
      type TEXT NOT NULL CHECK (type IN ('characters', 'weapons')),
      name TEXT NOT NULL,
      url TEXT,
      thumbnail_url TEXT,
      owner TEXT,
      rank REAL,
      price_currency TEXT,
      price_amount REAL,
      value REAL,
      discount REAL,
      progress REAL,
      rarity_class TEXT,
      perk1 TEXT,
      perk2 TEXT,
      level INTEGER,
      character_tokens REAL,
      health REAL,
      shield REAL,
      talent_points_available REAL,
      talent_points_total REAL,
      earn_rate REAL,
      xp REAL,
      wear REAL,
      star_level INTEGER,
      damage REAL,
      reload_time REAL,
      ammo REAL,
      range_value REAL,
      attributes_json TEXT NOT NULL,
      search_text TEXT NOT NULL
    );

    CREATE INDEX nfts_collection_idx ON nfts(collection);
    CREATE INDEX nfts_type_idx ON nfts(type);
    CREATE INDEX nfts_name_idx ON nfts(name);
    CREATE INDEX nfts_price_amount_idx ON nfts(price_amount);
    CREATE INDEX nfts_rank_idx ON nfts(rank);
  `);

    const insertCollection = db.prepare(`
    INSERT INTO collections (
      id, name, type, nft_count, holder_count, description, icon_url
    ) VALUES (
      @id, @name, @type, @nftCount, @holderCount, @description, @iconUrl
    )
  `);

    const insertNft = db.prepare(`
    INSERT INTO nfts (
      identifier, collection, type, name, url, thumbnail_url, owner, rank,
      price_currency, price_amount, value, discount, progress, rarity_class,
      perk1, perk2, level, character_tokens, health, shield,
      talent_points_available, talent_points_total, earn_rate, xp, wear,
      star_level, damage, reload_time, ammo, range_value, attributes_json,
      search_text
    ) VALUES (
      @identifier, @collection, @type, @name, @url, @thumbnailUrl, @owner, @rank,
      @priceCurrency, @priceAmount, @value, @discount, @progress, @rarityClass,
      @perk1, @perk2, @level, @characterTokens, @health, @shield,
      @talentPointsAvailable, @talentPointsTotal, @earnRate, @xp, @wear,
      @starLevel, @damage, @reloadTime, @ammo, @range, @attributesJson,
      @searchText
    )
  `);

    const insertAll = db.transaction(() => {
      for (const collectionId of collectionIds) {
        const type = collectionTypeForId(appInfo, collectionId);
        const collectionDir = path.join(dataDirectory, collectionId);
        const collectionInfo = readJson<RawObject>(
          path.join(collectionDir, "info.json"),
        );
        const nfts = readJson<Record<string, RawObject>>(
          path.join(collectionDir, "nfts.json"),
        );
        const rows = Object.values(nfts);
        const assets =
          typeof collectionInfo.assets === "object" &&
          collectionInfo.assets !== null
            ? (collectionInfo.assets as RawObject)
            : {};

        insertCollection.run({
          id: collectionId,
          name: stringOrNull(collectionInfo.name) ?? collectionId,
          type,
          nftCount: rows.length,
          holderCount: integerOrNull(collectionInfo.holderCount),
          description: stringOrNull(assets.description),
          iconUrl: stringOrNull(assets.pngUrl) ?? stringOrNull(assets.svgUrl),
        });

        for (const raw of rows) {
          const nft = normalizeNft(raw, type);
          insertNft.run({
            identifier: nft.identifier,
            collection: nft.collection,
            type: nft.type,
            name: nft.name,
            url: nft.url,
            thumbnailUrl: nft.thumbnailUrl,
            owner: nft.owner,
            rank: nft.rank,
            priceCurrency: nft.priceCurrency,
            priceAmount: nft.priceAmount,
            value: nft.value,
            discount: nft.discount,
            progress: nft.progress,
            rarityClass: nft.type === "characters" ? nft.rarityClass : null,
            perk1: nft.type === "characters" ? nft.perk1 : null,
            perk2: nft.type === "characters" ? nft.perk2 : null,
            level: nft.level,
            characterTokens:
              nft.type === "characters" ? nft.characterTokens : null,
            health: nft.type === "characters" ? nft.health : null,
            shield: nft.type === "characters" ? nft.shield : null,
            talentPointsAvailable:
              nft.type === "characters" ? nft.talentPointsAvailable : null,
            talentPointsTotal:
              nft.type === "characters" ? nft.talentPointsTotal : null,
            earnRate: nft.type === "characters" ? nft.earnRate : null,
            xp: nft.type === "weapons" ? nft.xp : null,
            wear: nft.type === "weapons" ? nft.wear : null,
            starLevel: nft.type === "weapons" ? nft.starLevel : null,
            damage: nft.type === "weapons" ? nft.damage : null,
            reloadTime: nft.type === "weapons" ? nft.reloadTime : null,
            ammo: nft.type === "weapons" ? nft.ammo : null,
            range: nft.type === "weapons" ? nft.range : null,
            attributesJson: JSON.stringify(nft.attributes),
            searchText: searchTextFor(nft),
          });
        }
      }
    });

    insertAll();
    db.pragma("optimize");
    db.close();
    closed = true;
    removeSqliteSidecars(outputPath);
    renameSync(temporaryPath, outputPath);
  } catch (error) {
    if (!closed) {
      db.close();
    }
    removeSqliteFiles(temporaryPath);
    throw error;
  }

  return { outputPath, collections: collectionIds.length };
}
