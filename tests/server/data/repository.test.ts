import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildSqliteDatabase } from "@/server/data/build";
import { SqliteCantinaRepository } from "@/server/data/sqlite-repository";

function writeJson(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createFixtureDataDir() {
  const root = mkdtempSync(path.join(tmpdir(), "cantina-repo-"));
  const dataDir = path.join(root, "data");
  mkdirSync(dataDir, { recursive: true });

  writeJson(path.join(dataDir, "info.json"), {
    variables: {
      collections: {
        characters: ["CHAR-123456"],
        weapons: ["WEAPON-123456"],
        allCharacters: "All-Characters",
        allWeapons: "All-Weapons",
      },
    },
    contents: { en: {} },
  });

  mkdirSync(path.join(dataDir, "CHAR-123456"));
  writeJson(path.join(dataDir, "CHAR-123456", "info.json"), {
    collection: "CHAR-123456",
    name: "Characters",
    holderCount: 2,
    nftCount: 2,
    assets: {
      description: "Character collection",
      pngUrl: "https://example.com/characters.png",
    },
  });
  writeJson(path.join(dataDir, "CHAR-123456", "nfts.json"), {
    "CHAR-123456-0001": {
      identifier: "CHAR-123456-0001",
      collection: "CHAR-123456",
      name: "Alpha Ape",
      url: "https://example.com/alpha.png",
      thumbnailUrl: "https://example.com/alpha-thumb.png",
      owner: "erd1alpha",
      rank: 2,
      priceCurrency: "EGLD",
      priceAmount: 1.5,
      rarityClass: "Gold",
      perk1: "Nano Meds",
      perk2: "Hodler",
      level: 11,
      characterTokens: 100,
      health: 5000,
      shield: 2500,
      value: 2.5,
      discount: -40,
      progress: 50,
    },
    "CHAR-123456-0002": {
      identifier: "CHAR-123456-0002",
      collection: "CHAR-123456",
      name: "Beta Ape",
      url: null,
      thumbnailUrl: null,
      owner: null,
      rank: 1,
      priceCurrency: null,
      priceAmount: null,
      rarityClass: "Epic",
      perk1: null,
      perk2: null,
      level: 8,
      characterTokens: 20,
      health: 4500,
      shield: 2000,
      value: 1.2,
      discount: null,
      progress: 20,
    },
  });

  mkdirSync(path.join(dataDir, "WEAPON-123456"));
  writeJson(path.join(dataDir, "WEAPON-123456", "info.json"), {
    collection: "WEAPON-123456",
    name: "Weapons",
    holderCount: 1,
    nftCount: 1,
    assets: {
      description: "Weapon collection",
      pngUrl: "https://example.com/weapons.png",
    },
  });
  writeJson(path.join(dataDir, "WEAPON-123456", "nfts.json"), {
    "WEAPON-123456-0001": {
      identifier: "WEAPON-123456-0001",
      collection: "WEAPON-123456",
      name: "Railgun-X",
      url: "https://example.com/railgun.png",
      thumbnailUrl: "https://example.com/railgun-thumb.png",
      owner: "erd1weapon",
      rank: null,
      priceCurrency: "EGLD",
      priceAmount: 0.2,
      xp: 1200,
      wear: 91.2,
      level: 4,
      starLevel: 2,
      damage: 2100,
      reloadTime: 2.1,
      ammo: 4,
      range: 12,
      value: 0.4,
      discount: -50,
      progress: 12,
    },
    "WEAPON-123456-0002": {
      identifier: "WEAPON-123456-0002",
      collection: "WEAPON-123456",
      name: "Railgun-X",
      url: "https://example.com/railgun-2.png",
      thumbnailUrl: "https://example.com/railgun-2-thumb.png",
      owner: "erd1weapon",
      rank: null,
      priceCurrency: null,
      priceAmount: null,
      xp: 400,
      wear: 20,
      level: 2,
      starLevel: 1,
      damage: 1300,
      reloadTime: 2.2,
      ammo: 4,
      range: 10,
      value: 0.2,
      discount: null,
      progress: 8,
    },
    "WEAPON-123456-0003": {
      identifier: "WEAPON-123456-0003",
      collection: "WEAPON-123456",
      name: "Blaster-X",
      url: "https://example.com/blaster.png",
      thumbnailUrl: "https://example.com/blaster-thumb.png",
      owner: "erd1weapon",
      rank: null,
      priceCurrency: null,
      priceAmount: null,
      xp: 200,
      wear: 10,
      level: 1,
      starLevel: 2,
      damage: 900,
      reloadTime: 1.8,
      ammo: 8,
      range: 8,
      value: 0.1,
      discount: null,
      progress: 5,
    },
  });

  return { dataDir, dbPath: path.join(root, "cantina.sqlite") };
}

describe("SQLite repository", () => {
  let repository: SqliteCantinaRepository | undefined;

  afterEach(() => {
    repository?.close();
    repository = undefined;
  });

  it("builds summaries and virtual collection pages without loading JSON in app code", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });
    repository = new SqliteCantinaRepository(dbPath);

    expect(repository.getCollectionGroups().characters).toHaveLength(1);
    expect(repository.getCollectionSummary("All-Characters")).toMatchObject({
      id: "All-Characters",
      type: "characters",
      nftCount: 2,
    });

    const firstPage = repository.getCollectionPage({
      identifier: "All-Characters",
      type: "characters",
      page: 1,
      pageSize: 10,
      search: "ape",
      sortBy: "rank",
      sortDirection: "asc",
      listing: "all",
    });

    expect(firstPage.total).toBe(2);
    expect(firstPage.rows.map((row) => row.identifier)).toEqual([
      "CHAR-123456-0002",
      "CHAR-123456-0001",
    ]);
    expect(firstPage.rows[0]).not.toHaveProperty("attributes");

    const listedNanoMeds = repository.getCollectionPage({
      identifier: "All-Characters",
      type: "characters",
      page: 1,
      pageSize: 10,
      search: undefined,
      sortBy: "identifier",
      sortDirection: "asc",
      listing: "listed",
      perk: "Nano Meds",
      level: 11,
      minValue: 2,
      maxProgress: 60,
    });

    expect(listedNanoMeds.rows.map((row) => row.identifier)).toEqual([
      "CHAR-123456-0001",
    ]);
  });

  it("clamps collection pages above the available range", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });
    repository = new SqliteCantinaRepository(dbPath);

    const page = repository.getCollectionPage({
      identifier: "All-Characters",
      type: "characters",
      page: 99,
      pageSize: 10,
      search: undefined,
      sortBy: "identifier",
      sortDirection: "asc",
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
    });

    expect(page.page).toBe(1);
    expect(page.rows).toHaveLength(2);
  });

  it("finds NFT details and returns compact search results", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });
    repository = new SqliteCantinaRepository(dbPath);

    expect(repository.findNft("WEAPON-123456-0001")).toMatchObject({
      type: "weapons",
      name: "Railgun-X",
      damage: 2100,
    });

    const weaponPage = repository.getCollectionPage({
      identifier: "All-Weapons",
      type: "weapons",
      page: 1,
      pageSize: 10,
      search: "rail",
      sortBy: "identifier",
      sortDirection: "asc",
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
    });

    expect(weaponPage.rows[0]).toMatchObject({
      identifier: "WEAPON-123456-0001",
      url: "https://example.com/railgun.png",
      thumbnailUrl: "https://example.com/railgun-thumb.png",
    });

    expect(repository.searchNfts("rail", 5)).toEqual([
      {
        identifier: "WEAPON-123456-0001",
        collection: "WEAPON-123456",
        type: "weapons",
        name: "Railgun-X",
        url: "https://example.com/railgun.png",
        thumbnailUrl: "https://example.com/railgun-thumb.png",
      },
      {
        identifier: "WEAPON-123456-0002",
        collection: "WEAPON-123456",
        type: "weapons",
        name: "Railgun-X",
        url: "https://example.com/railgun-2.png",
        thumbnailUrl: "https://example.com/railgun-2-thumb.png",
      },
    ]);
  });

  it("computes home insights from aggregate SQLite queries", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });
    repository = new SqliteCantinaRepository(dbPath);

    const insights = repository.getHomeInsights();

    expect(insights.market).toEqual([
      {
        type: "characters",
        label: "Characters",
        total: 2,
        listed: 1,
        floorPrice: 1.5,
        averagePrice: 1.5,
        averageValue: 1.85,
      },
      {
        type: "weapons",
        label: "Weapons",
        total: 3,
        listed: 1,
        floorPrice: 0.2,
        averagePrice: 0.2,
        averageValue: 0.233333,
      },
    ]);
    expect(insights.topCollections).toContainEqual(
      expect.objectContaining({
      id: "CHAR-123456",
      listedCount: 1,
      floorPrice: 1.5,
      }),
    );
    expect(insights.rarityDistribution).toEqual([
      { label: "Epic", count: 1 },
      { label: "Gold", count: 1 },
    ]);
    expect(insights.weaponFamilies).toEqual([
      { label: "Railgun-X", count: 2 },
      { label: "Blaster-X", count: 1 },
    ]);
    expect(insights.weaponStarMatrix).toEqual([
      {
        weapon: "Railgun-X",
        total: 2,
        stars: [
          { starLevel: 1, count: 1 },
          { starLevel: 2, count: 1 },
        ],
      },
      {
        weapon: "Blaster-X",
        total: 1,
        stars: [{ starLevel: 2, count: 1 }],
      },
    ]);
    expect(insights.topPerks).toContainEqual({ label: "Nano Meds", count: 1 });
  });

  it("keeps the previous SQLite database intact when a rebuild fails", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });

    const badRoot = mkdtempSync(path.join(tmpdir(), "cantina-bad-rebuild-"));
    const badDataDir = path.join(badRoot, "data");
    mkdirSync(badDataDir, { recursive: true });
    writeJson(path.join(badDataDir, "info.json"), {
      variables: {
        collections: {
          characters: ["MISSING-123456"],
          weapons: [],
        },
      },
    });

    expect(() =>
      buildSqliteDatabase({ dataDirectory: badDataDir, outputPath: dbPath }),
    ).toThrow();

    repository = new SqliteCantinaRepository(dbPath);
    expect(repository.getHomeStats()).toMatchObject({
      totalNfts: 5,
      characterCount: 2,
      weaponCount: 3,
    });
  });
});
