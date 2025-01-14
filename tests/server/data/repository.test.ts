import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildSqliteDatabase } from "@/server/data/build";
import { SqliteCantinaRepository } from "@/server/data/sqlite-repository";

function writeJson(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeCsv(directory: string, fileName: string, contents: string[]) {
  writeFileSync(path.join(directory, fileName), contents.join("\n"), "utf8");
}

function createGameplayDataDir() {
  const directory = mkdtempSync(path.join(tmpdir(), "cantina-repo-gameplay-"));

  writeCsv(directory, "Perks.csv", [
    "ID,Min,MinKoef,Max,MaxKoef,Name,Description",
    "Nano Meds,50,0.05,150,0.25,Nano Meds,Health regenerates faster when shield is full.",
    "Hodler,10,1.1,100,1.5,Hodler,Increases crown earnings.",
  ]);
  writeCsv(directory, "Character.Info2.csv", [
    "ID,Rarity,Species,RaceID,RaceTokenID,RoleID,NameID,DescID,Price,Speed,TalentID,SkillID,UnlockMethod,UnlockInEventID,InventorySortOrder,SlotUnlockAtLevel1,SlotUnlockAtLevel2,IsNFT,TotalSupply,NFTTokenID,VisibleStartDate,VisibleEndDate",
    "NFT_Ape_Gold,2,Genesis Space Ape,Ape,,Character_role_fighter,,,0,510,,FreeCharacter6_Skill,,,,5,10,True,-1,,,",
    "NFT_Ape_Epic,3,Genesis Space Ape,Ape,,Character_role_fighter,,,0,510,,FreeCharacter6_Skill,,,,5,10,True,-1,,,",
  ]);
  writeCsv(directory, "Character.Levels.Info.csv", [
    "Level,FreeCharacterPriceID,NFTCharacterPriceID,RequiredTokens,RewardPoolID",
    "11,price_ch_upgrade_lvl_11,price_ch_nft_upgrade_lvl_11,550,reward_ch_upgrade",
    "12,price_ch_upgrade_lvl_12,price_ch_nft_upgrade_lvl_12,680,reward_ch_upgrade",
  ]);
  writeCsv(directory, "Character.Levels.Stats.csv", [
    "ID,Level,Health,Shield,TalentPoints,SkillLevel,CrownEarnRate",
    "NFT_Ape_Gold,11,5000,2500,30,5,2.4",
    "NFT_Ape_Gold,12,5200,2650,33,6,2.6",
  ]);
  writeCsv(directory, "Character.Skills.Stats.csv", [
    "ID,StatType,StatValueLv1,StatValueLv2,StatValueLv3,StatValueLv4,StatValueLv5,StatValueLv6,StatValueLv7,StatValueLv8,StatValueLv9,StatValueLv10,VisibleOnUI",
    "NFT_Ape_Gold,character_skill_damage,1,2,3,4,5,6,7,8,9,10,1",
  ]);
  writeCsv(directory, "Character.Talents.Info.csv", [
    "ID,Name,Category,MinValue,MaxValue,Param1,Param2,Description",
    "Nano Meds,Talent_NanoMeds_Name,1,0.05,0.25,,,Talent_NanoMeds_Desc",
  ]);
  writeCsv(directory, "Weapon.Data.csv", [
    "ID,WeaponType,CollectionID,StarLevel,IsNFT,DamageIncrease,StatType,StatValue,FusePriceID,FuseItemCount,FuseRewardPoolID,DismantleRewardPoolID,SacrificeXPMultiplier,NameID,DescriptionID,TokenID,ImageName,NFTName",
    "WeaponType_RailGun_Arsenal-X_Star1,WeaponType_RailGun,Arsenal-X,1,True,25.0,,,weapon_fuse_star1,3,weapon_fuse_star1,weapon_dismantle_star1,1.0,WeaponType_RailGun_Arsenal-X_Name,WeaponType_RailGun_Arsenal-X_Desc,WEAPON-123456,RailGun-X,WeaponType_RailGun_Arsenal-X_Name",
    "WeaponType_RailGun_Arsenal-X_Star2,WeaponType_RailGun,Arsenal-X,2,True,32.0,weapon_projectile_range,0.5,weapon_fuse_star2,3,weapon_fuse_star2,weapon_dismantle_star2,1.1,WeaponType_RailGun_Arsenal-X_Name,WeaponType_RailGun_Arsenal-X_Desc,WEAPON-123456,RailGun-X,WeaponType_RailGun_Arsenal-X_Name",
    "WeaponType_AssaultGun_Arsenal-X_Star1,WeaponType_AssaultGun,Arsenal-X,1,True,30.0,,,weapon_fuse_star1,3,weapon_fuse_star1,weapon_dismantle_star1,1.0,WeaponType_AssaultGun_Arsenal-X_Name,WeaponType_AssaultGun_Arsenal-X_Desc,WEAPON-123456,Blaster-X,WeaponType_AssaultGun_Arsenal-X_Name",
  ]);
  writeCsv(directory, "Weapon.Info.csv", [
    "WeaponType,StatType,StatValue,VisibleOnUI",
    "WeaponType_RailGun,weapon_damage,1100,1",
    "WeaponType_RailGun,weapon_reloadTime,2,1",
    "WeaponType_RailGun,weapon_ammo,2,1",
    "WeaponType_RailGun,weapon_projectile_range,10,1",
  ]);
  writeCsv(directory, "Weapon.Levels.csv", [
    "Level,XPNeeded,FreeWeaponPriceID,NFTWeaponPriceID,RewardPoolID",
    "4,600,price_wp_upgrade_lvl_4,price_wp_nft_upgrade_lvl_4,reward_wp_upgrade",
    "5,1200,price_wp_upgrade_lvl_5,price_wp_nft_upgrade_lvl_5,reward_wp_upgrade",
  ]);
  writeCsv(directory, "GameItems.csv", [
    "ItemID,NameID,Category,IsTradable,Rarity,Color,InventorySortOrder,MaxCount,DescriptionID",
    "Shards,Shards_Name,Currencies,False,Common,#F5BF40,0,2000000,Shards_Desc",
    "CrownDollar,CrownDollar_Name,Currencies,False,Epic,#FFDF6D,1,2000000,CrownDollar_Desc",
    "CareerPoints,CareerPoints_Name,Currencies,False,Common,#FFFFFF,2,2000000,CareerPoints_Desc",
  ]);
  writeCsv(directory, "PricePool.csv", [
    "ID,Platform,PriceType,ItemID,Amount",
    "price_ch_nft_upgrade_lvl_12,all,item,CrownDollar,7",
    "price_wp_nft_upgrade_lvl_5,all,item,Shards,500",
    "weapon_fuse_star2,all,item,Shards,6000",
  ]);
  writeCsv(directory, "RewardPool.csv", [
    "ID,RNGMethod,RewardType,RewardID,AmountMin,AmountMax,Chance",
    "reward_ch_upgrade,choose_one,item,CareerPoints,20,20,100",
    "reward_wp_upgrade,choose_one,item,CareerPoints,10,10,100",
    "weapon_fuse_star2,choose_one,item,CareerPoints,10,10,100",
    "weapon_dismantle_star2,choose_one,item,Shards,400,400,100",
  ]);
  writeCsv(directory, "Stats.csv", [
    "StatID,Category,StackingType,ValueType,ValueFormatID,NameID,DescID",
    "weapon_projectile_range,weapon,add,float,,Range,Weapon range",
    "weapon_damage,weapon,add,float,,Damage,Weapon damage",
    "weapon_reloadTime,weapon,add,float,,Reload Time,Weapon reload time",
    "weapon_ammo,weapon,add,float,,Ammo,Weapon ammo",
    "character_skill_damage,character,add,float,,Skill Damage,Character skill damage",
  ]);
  writeCsv(directory, "Shop.csv", [
    "StoreItemID,Category,PricePoolID,RewardPoolID,PurchaseLimit,IsPurchaseLimitDaily,IsSpecial,LayoutType,TotalSupply,Bonus,StartDate,Duration,NameID,DescriptionID,UserTypeFilter,UserSpendingFilter,MinUserCP,MaxUserCP,MinUserLevel,MaxUserLevel,MinUserAge,MaxUserAge,EventRestrictionParam,IsSpecialOffer,IsEnabled",
    "shop_shards,Resources,weapon_fuse_star2,weapon_dismantle_star2,1,True,False,Small,-1,0,,,,,,,,,,,,,,False,True",
  ]);

  return directory;
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
      species: "Genesis Space Ape",
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
      species: "Space Shark",
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
    expect(repository.getGameplaySummary()).toMatchObject({
      sourceFiles: 0,
      sourceRows: 0,
    });
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
    expect(insights).not.toHaveProperty("topCollections");
    expect(insights.characterMarket).toEqual([
      {
        label: "Ape Gold",
        detail: "Ape / Gold",
        total: 1,
        listed: 1,
        floorPrice: 1.5,
        averagePrice: 1.5,
        averageValue: 2.5,
      },
      {
        label: "Shark Epic",
        detail: "Shark / Epic",
        total: 1,
        listed: 0,
        floorPrice: null,
        averagePrice: null,
        averageValue: 1.2,
      },
    ]);
    expect(insights.weaponMarket).toEqual([
      {
        label: "Railgun-X",
        detail: "Weapon family",
        total: 2,
        listed: 1,
        floorPrice: 0.2,
        averagePrice: 0.2,
        averageValue: 0.3,
      },
      {
        label: "Blaster-X",
        detail: "Weapon family",
        total: 1,
        listed: 0,
        floorPrice: null,
        averagePrice: null,
        averageValue: 0.1,
      },
    ]);
    expect(insights.characterRarityBySpecies).toEqual([
      {
        species: "Ape",
        total: 1,
        items: [{ label: "Gold", count: 1 }],
      },
      {
        species: "Shark",
        total: 1,
        items: [{ label: "Epic", count: 1 }],
      },
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
    expect(insights.perkDistribution).toContainEqual({
      label: "Nano Meds",
      count: 1,
    });
  });

  it("keeps every character perk in the home distribution", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    const nftsPath = path.join(dataDir, "CHAR-123456", "nfts.json");
    const nfts = JSON.parse(readFileSync(nftsPath, "utf8")) as Record<
      string,
      Record<string, unknown>
    >;

    for (let index = 0; index < 5; index += 1) {
      const id = `CHAR-123456-extra-${index}`;
      nfts[id] = {
        identifier: id,
        collection: "CHAR-123456",
        name: `Extra Ape ${index}`,
        rarityClass: "Bronze",
        perk1: `Perk ${index * 2}`,
        perk2: `Perk ${index * 2 + 1}`,
        species: "Genesis Space Ape",
      };
    }

    writeJson(nftsPath, nfts);
    buildSqliteDatabase({ dataDirectory: dataDir, outputPath: dbPath });
    repository = new SqliteCantinaRepository(dbPath);

    const insights = repository.getHomeInsights();

    expect(insights.perkDistribution).toHaveLength(12);
    expect(insights.perkDistribution).toContainEqual({
      label: "Perk 9",
      count: 1,
    });
    expect(insights.perkDistribution).not.toContainEqual(
      expect.objectContaining({ label: "Other" }),
    );
  });

  it("keeps gameplay source data out of home and collection summaries", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({
      dataDirectory: dataDir,
      gameDataDirectory: createGameplayDataDir(),
      outputPath: dbPath,
    });
    repository = new SqliteCantinaRepository(dbPath);

    expect(repository.getHomeInsights()).not.toHaveProperty("gameplay");
    expect(repository.getGameplaySummary()).toMatchObject({
      sourceFiles: 14,
      sourceRows: 35,
    });
  });

  it("enriches character and weapon NFT details from gameplay tables", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({
      dataDirectory: dataDir,
      gameDataDirectory: createGameplayDataDir(),
      outputPath: dbPath,
    });
    repository = new SqliteCantinaRepository(dbPath);

    expect(repository.getNftGameplay("CHAR-123456-0001")).toMatchObject({
      character: {
        profile: {
          id: "NFT_Ape_Gold",
          species: "Genesis Space Ape",
          rarity: "Gold",
          speed: 510,
        },
        currentLevel: { level: 11, health: 5000, shield: 2500 },
        nextLevel: { level: 12, health: 5200, shield: 2650 },
        maxLevel: { level: 12, health: 5200, shield: 2650 },
        nextUpgrade: {
          level: 12,
          requiredTokens: 680,
          price: [{ itemId: "CrownDollar", amount: 7 }],
          rewards: [
            {
              rewardId: "CareerPoints",
              amountMin: 20,
              amountMax: 20,
              chance: 100,
            },
          ],
        },
        skillStats: [
          {
            statType: "character_skill_damage",
            label: "Skill Damage",
            currentValue: "5",
            nextValue: "6",
          },
        ],
      },
    });

    expect(repository.getNftGameplay("WEAPON-123456-0001")).toMatchObject({
      weapon: {
        weaponType: "WeaponType_RailGun",
        collectionId: "Arsenal-X",
        currentStarBonus: {
          starLevel: 2,
          damageIncrease: 32,
          statType: "weapon_projectile_range",
          statLabel: "Range",
          statValue: 0.5,
          fuseItemCount: 3,
        },
        allStarBonuses: [
          { starLevel: 1, damageIncrease: 25 },
          { starLevel: 2, damageIncrease: 32 },
        ],
        baseStats: expect.arrayContaining([
          { statType: "weapon_damage", label: "Damage", value: "1100" },
          { statType: "weapon_projectile_range", label: "Range", value: "10" },
        ]),
        nextLevel: {
          level: 5,
          xpNeeded: 1200,
          price: [{ itemId: "Shards", amount: 500 }],
        },
        fusePrice: [{ itemId: "Shards", amount: 6000 }],
        fuseRewards: [{ rewardId: "CareerPoints", amountMin: 10 }],
        dismantleRewards: [{ rewardId: "Shards", amountMin: 400 }],
      },
    });
  });

  it("returns interpreted gameplay dashboards for public data pages", () => {
    const { dataDir, dbPath } = createFixtureDataDir();
    buildSqliteDatabase({
      dataDirectory: dataDir,
      gameDataDirectory: createGameplayDataDir(),
      outputPath: dbPath,
    });
    repository = new SqliteCantinaRepository(dbPath);

    expect(repository.getCharacterGameplayDashboard()).toMatchObject({
      perks: expect.arrayContaining([
        expect.objectContaining({
          id: "Nano Meds",
          description: "Health regenerates faster when shield is full.",
          minRoll: 50,
          maxRoll: 150,
        }),
      ]),
      rarityProfiles: [
        { label: "Gold", count: 1 },
        { label: "Epic", count: 1 },
      ],
      levelProgression: expect.arrayContaining([
        expect.objectContaining({
          level: 12,
          averageHealth: 5200,
          averageShield: 2650,
          talentPoints: 33,
          crownEarnRate: 2.6,
        }),
      ]),
      profileProgression: expect.arrayContaining([
        expect.objectContaining({
          key: "NFT_Ape_Gold",
          label: "Ape Gold",
          species: "Genesis Space Ape",
          rarity: "Gold",
          levels: expect.arrayContaining([
            expect.objectContaining({
              level: 12,
              health: 5200,
              shield: 2650,
              crownEarnRate: 2.6,
            }),
          ]),
        }),
      ]),
      statProfiles: expect.arrayContaining([
        expect.objectContaining({
          label: "Genesis Space Ape Gold",
          species: "Genesis Space Ape",
          rarity: "Gold",
          stats: expect.arrayContaining([
            { label: "Health", value: 5200 },
            { label: "Shield", value: 2650 },
            { label: "Speed", value: 510 },
            { label: "Earn rate", value: 2.6 },
          ]),
        }),
      ]),
      levelCosts: expect.arrayContaining([
        expect.objectContaining({
          level: 12,
          requiredTokens: 680,
          price: expect.arrayContaining([{ itemId: "CrownDollar", amount: 7 }]),
        }),
      ]),
    });

    expect(repository.getWeaponGameplayDashboard()).toMatchObject({
      starBonuses: expect.arrayContaining([
        expect.objectContaining({
          weapon: "RailGun",
          starLevel: 2,
          damageIncrease: 32,
          statLabel: "Range",
          fusePrice: expect.arrayContaining([
            { itemId: "Shards", amount: 6000 },
          ]),
        }),
      ]),
      baseStats: expect.arrayContaining([
        expect.objectContaining({
          weapon: "RailGun",
          stats: expect.arrayContaining([
            expect.objectContaining({ label: "Damage", value: "1100" }),
          ]),
        }),
      ]),
    });

    expect(repository.getEconomyGameplayDashboard()).toMatchObject({
      currencyUsage: expect.arrayContaining([
        expect.objectContaining({
          itemId: "Shards",
          totalAmount: 6500,
          uses: 2,
        }),
        expect.objectContaining({
          itemId: "CrownDollar",
          totalAmount: 7,
          uses: 1,
        }),
      ]),
      upgradeCosts: expect.arrayContaining([
        expect.objectContaining({
          category: "Character upgrade",
          label: "Level 12",
          requirement: "680 character tokens",
          price: expect.arrayContaining([{ itemId: "CrownDollar", amount: 7 }]),
        }),
        expect.objectContaining({
          category: "Weapon fuse",
          label: "RailGun star 2",
          requirement: "3 matching weapons",
          price: expect.arrayContaining([{ itemId: "Shards", amount: 6000 }]),
        }),
      ]),
    });
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
