import Database from "better-sqlite3";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  insertGameplayData,
  parseCsv,
  readGameplayCsvFiles,
} from "@/server/data/gameplay";
import { DEFAULT_GAME_DATA_DIRECTORY } from "@/server/data/paths";

function writeCsv(directory: string, fileName: string, contents: string) {
  writeFileSync(path.join(directory, fileName), contents, "utf8");
}

function createGameplayFixture() {
  const directory = mkdtempSync(path.join(tmpdir(), "cantina-gameplay-"));

  writeCsv(
    directory,
    "Perks.csv",
    [
      "ID,Min,MinKoef,Max,MaxKoef,Name,Description",
      "Overachiever,50,1.08,150,1.4,Overachiever,Gain extra Character XP after each game.",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "Weapon.Data.csv",
    [
      "ID,WeaponType,CollectionID,StarLevel,IsNFT,DamageIncrease,StatType,StatValue,FusePriceID,FuseItemCount,FuseRewardPoolID,DismantleRewardPoolID,SacrificeXPMultiplier,NameID,DescriptionID,TokenID,ImageName,NFTName",
      "WeaponType_Shotgun_Default_Star1,WeaponType_Shotgun,Default,1,False,20.0,weapon_damage,100.0,weapon_fuse_star1,3.0,weapon_fuse_star1,weapon_dismantle_star1,1.0,WeaponType_Shotgun_Name,WeaponType_Shotgun_Desc,,,",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "Weapon.Info.csv",
    [
      "WeaponType,StatType,StatValue,VisibleOnUI",
      "WeaponType_Shotgun,weapon_damage,2200,1",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "Character.Talents.Info.csv",
    [
      "ID,Name,Category,MinValue,MaxValue,Param1,Param2,Description",
      "Overachiever,Talent_Overachiever_Name,1,1.01,1.15,,,Talent_Overachiever_Desc",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "Character.Levels.Stats.csv",
    [
      "ID,Level,Health,Shield,TalentPoints,SkillLevel,CrownEarnRate",
      "FREE_Character6,1,2500,1250,0,0,0.0",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "GameItems.csv",
    [
      "ItemID,NameID,Category,IsTradable,Rarity,Color,InventorySortOrder,MaxCount,DescriptionID",
      "Shards,Shards_Name,Currencies,False,Common,#F5BF40,0.0,2000000,Shards_Desc",
    ].join("\n"),
  );
  writeCsv(
    directory,
    "PricePool.csv",
    ["ID,Platform,PriceType,ItemID,Amount", "price_1,all,item,Shards,50"].join(
      "\n",
    ),
  );
  writeCsv(
    directory,
    "RewardPool.csv",
    [
      "ID,RNGMethod,RewardType,RewardID,AmountMin,AmountMax,Chance",
      "reward_1,roll_each,item,Shards,10,10,100.0",
    ].join("\n"),
  );

  return directory;
}

describe("gameplay data import", () => {
  let database: Database.Database | undefined;

  afterEach(() => {
    database?.close();
    database = undefined;
  });

  it("parses quoted CSV values without corrupting fields", () => {
    const parsed = parseCsv(
      'Name,Description,Value\r\n"Railgun, Mk II","Escaped ""quote""",42',
      "inline.csv",
    );

    expect(parsed.headers).toEqual(["Name", "Description", "Value"]);
    expect(parsed.rows).toEqual([
      {
        Name: "Railgun, Mk II",
        Description: 'Escaped "quote"',
        Value: "42",
      },
    ]);
  });

  it("reads the restored static gameplay database sources", () => {
    const files = readGameplayCsvFiles(DEFAULT_GAME_DATA_DIRECTORY);
    const rows = files.reduce((total, file) => total + file.rows.length, 0);
    const perks = files.find((file) => file.sourceName === "Perks.csv");
    const rewardPool = files.find((file) => file.sourceName === "RewardPool.csv");

    expect(files).toHaveLength(48);
    expect(rows).toBe(10_452);
    expect(perks?.headers).toEqual([
      "ID",
      "Min",
      "MinKoef",
      "Max",
      "MaxKoef",
      "Name",
      "Description",
    ]);
    expect(perks?.rows).toHaveLength(21);
    expect(rewardPool?.rows).toHaveLength(2_315);
  });

  it("imports gameplay CSVs into SQLite source and typed tables", () => {
    database = new Database(":memory:");
    const result = insertGameplayData(database, {
      gameDataDirectory: createGameplayFixture(),
    });

    expect(result).toMatchObject({
      sourceFiles: 8,
      sourceRows: 8,
      perks: 1,
      characterTalents: 1,
      characterLevels: 1,
      weaponStats: 1,
      weaponStarBonuses: 1,
      gameItems: 1,
      priceRows: 1,
      rewardRows: 1,
    });

    expect(
      database
        .prepare("SELECT Name FROM game_data_perks WHERE __row_index = 1")
        .get(),
    ).toEqual({ Name: "Overachiever" });
    expect(database.prepare("SELECT * FROM gameplay_perks").get()).toMatchObject({
      id: "Overachiever",
      name: "Overachiever",
      min_roll: 50,
      max_coefficient: 1.4,
    });
    expect(
      database.prepare("SELECT * FROM gameplay_weapon_star_bonuses").get(),
    ).toMatchObject({
      id: "WeaponType_Shotgun_Default_Star1",
      weapon_type: "WeaponType_Shotgun",
      star_level: 1,
      is_nft: 0,
      damage_increase: 20,
    });
  });
});
