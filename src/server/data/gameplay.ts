import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type CsvParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export type GameplayCsvFile = CsvParseResult & {
  sourceName: string;
  tableName: string;
  sha256: string;
};

export type GameplaySummary = {
  sourceFiles: number;
  sourceRows: number;
  perks: number;
  characterProfiles: number;
  characterLevelUpgrades: number;
  characterTalents: number;
  characterLevels: number;
  characterSkillStats: number;
  weaponStats: number;
  weaponStarBonuses: number;
  weaponLevelUpgrades: number;
  gameItems: number;
  priceRows: number;
  rewardRows: number;
  statDefinitions: number;
};

const STATIC_GAMEPLAY_TABLES = [
  "gameplay_source_files",
  "gameplay_perks",
  "gameplay_character_profiles",
  "gameplay_character_level_upgrades",
  "gameplay_character_talents",
  "gameplay_character_levels",
  "gameplay_character_skill_stats",
  "gameplay_weapon_stats",
  "gameplay_weapon_star_bonuses",
  "gameplay_weapon_level_upgrades",
  "gameplay_game_items",
  "gameplay_price_pool",
  "gameplay_reward_pool",
  "gameplay_stats_dictionary",
];

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function csvTableName(sourceName: string) {
  const withoutExtension = sourceName.replace(/\.csv$/i, "");
  const normalized = withoutExtension
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    throw new Error(`Cannot derive a SQLite table name from ${sourceName}`);
  }

  return `game_data_${normalized}`;
}

function parseCsvRecords(contents: string, sourceName: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;
  let fieldWasQuoted = false;

  const pushField = () => {
    record.push(field);
    field = "";
    fieldWasQuoted = false;
  };

  const pushRecord = () => {
    pushField();
    if (record.length > 1 || record[0] !== "") {
      records.push(record);
    }
    record = [];
  };

  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index];

    if (inQuotes) {
      if (char === '"') {
        if (contents[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      if (field.length === 0 && !fieldWasQuoted) {
        inQuotes = true;
        fieldWasQuoted = true;
      } else {
        field += char;
      }
      continue;
    }

    if (char === ",") {
      pushField();
      continue;
    }

    if (char === "\r" || char === "\n") {
      if (char === "\r" && contents[index + 1] === "\n") {
        index += 1;
      }
      pushRecord();
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new Error(`Unclosed quoted field in ${sourceName}`);
  }

  if (field.length > 0 || record.length > 0 || fieldWasQuoted) {
    pushRecord();
  }

  return records;
}

export function parseCsv(contents: string, sourceName = "inline.csv") {
  const records = parseCsvRecords(contents.replace(/^\uFEFF/, ""), sourceName);
  const [headers, ...body] = records;

  if (!headers || headers.length === 0) {
    throw new Error(`CSV file ${sourceName} does not contain a header row`);
  }

  const seenHeaders = new Set<string>();
  for (const header of headers) {
    if (header.length === 0) {
      throw new Error(`CSV file ${sourceName} contains an empty header`);
    }
    if (seenHeaders.has(header)) {
      throw new Error(`CSV file ${sourceName} repeats header ${header}`);
    }
    seenHeaders.add(header);
  }

  const rows = body.map((record, index) => {
    if (record.length !== headers.length) {
      throw new Error(
        `CSV file ${sourceName} row ${index + 2} has ${record.length} fields; expected ${headers.length}`,
      );
    }

    return Object.fromEntries(
      headers.map((header, headerIndex) => [header, record[headerIndex]]),
    );
  });

  return { headers, rows };
}

export function readGameplayCsvFiles(directory: string): GameplayCsvFile[] {
  if (!existsSync(directory)) {
    throw new Error(`Gameplay data directory not found at ${directory}`);
  }

  const fileNames = readdirSync(directory)
    .filter((fileName) => fileName.toLowerCase().endsWith(".csv"))
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new Error(`Gameplay data directory ${directory} contains no CSV files`);
  }

  const tableNames = new Set<string>();
  return fileNames.map((sourceName) => {
    const filePath = path.join(directory, sourceName);
    const contents = readFileSync(filePath, "utf8");
    const tableName = csvTableName(sourceName);

    if (tableNames.has(tableName)) {
      throw new Error(`Multiple gameplay CSV files map to ${tableName}`);
    }
    tableNames.add(tableName);

    return {
      sourceName,
      tableName,
      sha256: createHash("sha256").update(contents).digest("hex"),
      ...parseCsv(contents, sourceName),
    };
  });
}

function textValue(
  row: Record<string, string>,
  field: string,
  sourceName: string,
  rowIndex: number,
) {
  const value = row[field]?.trim() ?? "";
  if (!value) {
    throw new Error(`${sourceName} row ${rowIndex} is missing required ${field}`);
  }
  return value;
}

function nullableText(row: Record<string, string>, field: string) {
  const value = row[field]?.trim() ?? "";
  return value === "" ? null : value;
}

function nullableNumber(
  row: Record<string, string>,
  field: string,
  sourceName: string,
  rowIndex: number,
) {
  const value = nullableText(row, field);
  if (value === null) {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`${sourceName} row ${rowIndex} has invalid number ${field}`);
  }

  return numberValue;
}

function nullableInteger(
  row: Record<string, string>,
  field: string,
  sourceName: string,
  rowIndex: number,
) {
  const value = nullableNumber(row, field, sourceName, rowIndex);
  return value === null ? null : Math.trunc(value);
}

function booleanInteger(
  row: Record<string, string>,
  field: string,
  sourceName: string,
  rowIndex: number,
) {
  const value = textValue(row, field, sourceName, rowIndex).toLowerCase();
  if (value === "true" || value === "1") {
    return 1;
  }
  if (value === "false" || value === "0") {
    return 0;
  }
  const numericValue = Number(value);
  if (numericValue === 1) {
    return 1;
  }
  if (numericValue === 0) {
    return 0;
  }
  throw new Error(`${sourceName} row ${rowIndex} has invalid boolean ${field}`);
}

function rowsBySource(files: GameplayCsvFile[]) {
  return new Map(files.map((file) => [file.sourceName, file.rows]));
}

function dropExistingGameplayTables(db: Database.Database) {
  const dynamicRows = db
    .prepare(
      `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name LIKE 'game_data_%'
      ORDER BY name
    `,
    )
    .all() as { name: string }[];

  for (const table of [...STATIC_GAMEPLAY_TABLES, ...dynamicRows.map((row) => row.name)]) {
    db.exec(`DROP TABLE IF EXISTS ${quoteIdentifier(table)}`);
  }
}

function createGameplayTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE gameplay_source_files (
      source_name TEXT PRIMARY KEY,
      table_name TEXT NOT NULL UNIQUE,
      row_count INTEGER NOT NULL CHECK (row_count >= 0),
      column_count INTEGER NOT NULL CHECK (column_count > 0),
      sha256 TEXT NOT NULL
    );

    CREATE TABLE gameplay_perks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      min_roll REAL,
      min_coefficient REAL,
      max_roll REAL,
      max_coefficient REAL
    );

    CREATE TABLE gameplay_character_profiles (
      row_index INTEGER PRIMARY KEY,
      id TEXT NOT NULL,
      rarity INTEGER,
      species TEXT NOT NULL,
      race_id TEXT,
      role_id TEXT,
      price_id TEXT,
      speed REAL,
      talent_id TEXT,
      skill_id TEXT,
      slot_unlock_level_1 INTEGER,
      slot_unlock_level_2 INTEGER,
      is_nft INTEGER NOT NULL CHECK (is_nft IN (0, 1)),
      total_supply REAL,
      nft_token_id TEXT
    );

    CREATE TABLE gameplay_character_level_upgrades (
      level INTEGER PRIMARY KEY,
      free_character_price_id TEXT,
      nft_character_price_id TEXT,
      required_tokens REAL,
      reward_pool_id TEXT
    );

    CREATE TABLE gameplay_character_talents (
      id TEXT PRIMARY KEY,
      name_key TEXT NOT NULL,
      category INTEGER,
      min_value REAL,
      max_value REAL,
      param1 REAL,
      param2 REAL,
      description_key TEXT NOT NULL
    );

    CREATE TABLE gameplay_character_levels (
      character_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      health REAL NOT NULL,
      shield REAL NOT NULL,
      talent_points REAL NOT NULL,
      skill_level INTEGER NOT NULL,
      crown_earn_rate REAL NOT NULL,
      PRIMARY KEY (character_id, level)
    );

    CREATE TABLE gameplay_character_skill_stats (
      character_id TEXT NOT NULL,
      stat_type TEXT NOT NULL,
      stat_value_level_1 TEXT,
      stat_value_level_2 TEXT,
      stat_value_level_3 TEXT,
      stat_value_level_4 TEXT,
      stat_value_level_5 TEXT,
      stat_value_level_6 TEXT,
      stat_value_level_7 TEXT,
      stat_value_level_8 TEXT,
      stat_value_level_9 TEXT,
      stat_value_level_10 TEXT,
      visible_on_ui INTEGER,
      PRIMARY KEY (character_id, stat_type)
    );

    CREATE TABLE gameplay_weapon_stats (
      weapon_type TEXT NOT NULL,
      stat_type TEXT NOT NULL,
      stat_value TEXT NOT NULL,
      visible_on_ui INTEGER NOT NULL,
      PRIMARY KEY (weapon_type, stat_type)
    );

    CREATE TABLE gameplay_weapon_star_bonuses (
      id TEXT PRIMARY KEY,
      weapon_type TEXT NOT NULL,
      collection_id TEXT NOT NULL,
      star_level INTEGER NOT NULL,
      is_nft INTEGER NOT NULL CHECK (is_nft IN (0, 1)),
      damage_increase REAL,
      stat_type TEXT,
      stat_value REAL,
      fuse_price_id TEXT,
      fuse_item_count REAL,
      fuse_reward_pool_id TEXT,
      dismantle_reward_pool_id TEXT,
      sacrifice_xp_multiplier REAL,
      name_key TEXT,
      description_key TEXT,
      token_id TEXT,
      image_name TEXT,
      nft_name TEXT
    );

    CREATE TABLE gameplay_weapon_level_upgrades (
      level INTEGER PRIMARY KEY,
      xp_needed REAL,
      free_weapon_price_id TEXT,
      nft_weapon_price_id TEXT,
      reward_pool_id TEXT
    );

    CREATE TABLE gameplay_game_items (
      item_id TEXT PRIMARY KEY,
      name_key TEXT NOT NULL,
      category TEXT NOT NULL,
      is_tradable INTEGER NOT NULL CHECK (is_tradable IN (0, 1)),
      rarity TEXT,
      color TEXT,
      inventory_sort_order REAL,
      max_count REAL,
      description_key TEXT
    );

    CREATE TABLE gameplay_price_pool (
      row_index INTEGER PRIMARY KEY,
      id TEXT NOT NULL,
      platform TEXT NOT NULL,
      price_type TEXT NOT NULL,
      item_id TEXT,
      amount REAL
    );

    CREATE TABLE gameplay_reward_pool (
      row_index INTEGER PRIMARY KEY,
      id TEXT NOT NULL,
      rng_method TEXT NOT NULL,
      reward_type TEXT NOT NULL,
      reward_id TEXT,
      amount_min REAL,
      amount_max REAL,
      chance REAL
    );

    CREATE TABLE gameplay_stats_dictionary (
      stat_id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      stacking_type TEXT,
      value_type TEXT,
      value_format_key TEXT,
      name_key TEXT,
      description_key TEXT
    );

    CREATE INDEX gameplay_weapon_star_bonuses_weapon_idx
      ON gameplay_weapon_star_bonuses(weapon_type, collection_id, star_level);
    CREATE INDEX gameplay_weapon_star_bonuses_token_idx
      ON gameplay_weapon_star_bonuses(token_id, image_name);
    CREATE INDEX gameplay_character_profiles_lookup_idx
      ON gameplay_character_profiles(species, rarity, is_nft);
    CREATE INDEX gameplay_reward_pool_id_idx ON gameplay_reward_pool(id);
    CREATE INDEX gameplay_price_pool_id_idx ON gameplay_price_pool(id);
  `);
}

function insertSourceTables(db: Database.Database, files: GameplayCsvFile[]) {
  const insertSource = db.prepare(`
    INSERT INTO gameplay_source_files (
      source_name, table_name, row_count, column_count, sha256
    ) VALUES (
      @sourceName, @tableName, @rowCount, @columnCount, @sha256
    )
  `);

  for (const file of files) {
    const columns = file.headers
      .map((header) => `${quoteIdentifier(header)} TEXT NOT NULL`)
      .join(", ");

    db.exec(`
      CREATE TABLE ${quoteIdentifier(file.tableName)} (
        __row_index INTEGER PRIMARY KEY,
        ${columns}
      )
    `);

    const insertColumns = ["__row_index", ...file.headers]
      .map((header) => quoteIdentifier(header))
      .join(", ");
    const placeholders = [
      "@rowIndex",
      ...file.headers.map((_, index) => `@value${index}`),
    ].join(", ");
    const insertRawRow = db.prepare(`
      INSERT INTO ${quoteIdentifier(file.tableName)} (${insertColumns})
      VALUES (${placeholders})
    `);

    insertSource.run({
      sourceName: file.sourceName,
      tableName: file.tableName,
      rowCount: file.rows.length,
      columnCount: file.headers.length,
      sha256: file.sha256,
    });

    for (const [rowOffset, row] of file.rows.entries()) {
      insertRawRow.run(
        Object.fromEntries([
          ["rowIndex", rowOffset + 1],
          ...file.headers.map((header, index) => [
            `value${index}`,
            row[header] ?? "",
          ]),
        ]),
      );
    }
  }
}

function insertPerks(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_perks (
      id, name, description, min_roll, min_coefficient, max_roll, max_coefficient
    ) VALUES (
      @id, @name, @description, @minRoll, @minCoefficient, @maxRoll, @maxCoefficient
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      id: textValue(row, "ID", "Perks.csv", rowIndex),
      name: textValue(row, "Name", "Perks.csv", rowIndex),
      description: textValue(row, "Description", "Perks.csv", rowIndex),
      minRoll: nullableNumber(row, "Min", "Perks.csv", rowIndex),
      minCoefficient: nullableNumber(row, "MinKoef", "Perks.csv", rowIndex),
      maxRoll: nullableNumber(row, "Max", "Perks.csv", rowIndex),
      maxCoefficient: nullableNumber(row, "MaxKoef", "Perks.csv", rowIndex),
    });
  }
}

function insertCharacterProfiles(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const sourceName = "Character.Info2.csv";
  const insert = db.prepare(`
    INSERT INTO gameplay_character_profiles (
      row_index, id, rarity, species, race_id, role_id, price_id, speed,
      talent_id, skill_id, slot_unlock_level_1, slot_unlock_level_2, is_nft,
      total_supply, nft_token_id
    ) VALUES (
      @rowIndex, @id, @rarity, @species, @raceId, @roleId, @priceId, @speed,
      @talentId, @skillId, @slotUnlockLevel1, @slotUnlockLevel2, @isNft,
      @totalSupply, @nftTokenId
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      rowIndex: index + 1,
      id: textValue(row, "ID", sourceName, rowIndex),
      rarity: nullableInteger(row, "Rarity", sourceName, rowIndex),
      species: textValue(row, "Species", sourceName, rowIndex),
      raceId: nullableText(row, "RaceID"),
      roleId: nullableText(row, "RoleID"),
      priceId: nullableText(row, "Price"),
      speed: nullableNumber(row, "Speed", sourceName, rowIndex),
      talentId: nullableText(row, "TalentID"),
      skillId: nullableText(row, "SkillID"),
      slotUnlockLevel1: nullableInteger(
        row,
        "SlotUnlockAtLevel1",
        sourceName,
        rowIndex,
      ),
      slotUnlockLevel2: nullableInteger(
        row,
        "SlotUnlockAtLevel2",
        sourceName,
        rowIndex,
      ),
      isNft: booleanInteger(row, "IsNFT", sourceName, rowIndex),
      totalSupply: nullableNumber(row, "TotalSupply", sourceName, rowIndex),
      nftTokenId: nullableText(row, "NFTTokenID"),
    });
  }
}

function insertCharacterLevelUpgrades(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const sourceName = "Character.Levels.Info.csv";
  const insert = db.prepare(`
    INSERT INTO gameplay_character_level_upgrades (
      level, free_character_price_id, nft_character_price_id, required_tokens,
      reward_pool_id
    ) VALUES (
      @level, @freeCharacterPriceId, @nftCharacterPriceId, @requiredTokens,
      @rewardPoolId
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      level: nullableInteger(row, "Level", sourceName, rowIndex),
      freeCharacterPriceId: nullableText(row, "FreeCharacterPriceID"),
      nftCharacterPriceId: nullableText(row, "NFTCharacterPriceID"),
      requiredTokens: nullableNumber(row, "RequiredTokens", sourceName, rowIndex),
      rewardPoolId: nullableText(row, "RewardPoolID"),
    });
  }
}

function insertCharacterTalents(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_character_talents (
      id, name_key, category, min_value, max_value, param1, param2, description_key
    ) VALUES (
      @id, @nameKey, @category, @minValue, @maxValue, @param1, @param2,
      @descriptionKey
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      id: textValue(row, "ID", "Character.Talents.Info.csv", rowIndex),
      nameKey: textValue(row, "Name", "Character.Talents.Info.csv", rowIndex),
      category: nullableInteger(
        row,
        "Category",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
      minValue: nullableNumber(
        row,
        "MinValue",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
      maxValue: nullableNumber(
        row,
        "MaxValue",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
      param1: nullableNumber(
        row,
        "Param1",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
      param2: nullableNumber(
        row,
        "Param2",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
      descriptionKey: textValue(
        row,
        "Description",
        "Character.Talents.Info.csv",
        rowIndex,
      ),
    });
  }
}

function insertCharacterLevels(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_character_levels (
      character_id, level, health, shield, talent_points, skill_level,
      crown_earn_rate
    ) VALUES (
      @characterId, @level, @health, @shield, @talentPoints, @skillLevel,
      @crownEarnRate
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      characterId: textValue(row, "ID", "Character.Levels.Stats.csv", rowIndex),
      level: nullableInteger(
        row,
        "Level",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
      health: nullableNumber(
        row,
        "Health",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
      shield: nullableNumber(
        row,
        "Shield",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
      talentPoints: nullableNumber(
        row,
        "TalentPoints",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
      skillLevel: nullableInteger(
        row,
        "SkillLevel",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
      crownEarnRate: nullableNumber(
        row,
        "CrownEarnRate",
        "Character.Levels.Stats.csv",
        rowIndex,
      ),
    });
  }
}

function insertCharacterSkillStats(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_character_skill_stats (
      character_id, stat_type, stat_value_level_1, stat_value_level_2,
      stat_value_level_3, stat_value_level_4, stat_value_level_5,
      stat_value_level_6, stat_value_level_7, stat_value_level_8,
      stat_value_level_9, stat_value_level_10, visible_on_ui
    ) VALUES (
      @characterId, @statType, @statValueLevel1, @statValueLevel2,
      @statValueLevel3, @statValueLevel4, @statValueLevel5,
      @statValueLevel6, @statValueLevel7, @statValueLevel8,
      @statValueLevel9, @statValueLevel10, @visibleOnUi
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    const sourceName = "Character.Skills.Stats.csv";
    insert.run({
      characterId: textValue(row, "ID", sourceName, rowIndex),
      statType: textValue(row, "StatType", sourceName, rowIndex),
      statValueLevel1: nullableText(row, "StatValueLv1"),
      statValueLevel2: nullableText(row, "StatValueLv2"),
      statValueLevel3: nullableText(row, "StatValueLv3"),
      statValueLevel4: nullableText(row, "StatValueLv4"),
      statValueLevel5: nullableText(row, "StatValueLv5"),
      statValueLevel6: nullableText(row, "StatValueLv6"),
      statValueLevel7: nullableText(row, "StatValueLv7"),
      statValueLevel8: nullableText(row, "StatValueLv8"),
      statValueLevel9: nullableText(row, "StatValueLv9"),
      statValueLevel10: nullableText(row, "StatValueLv10"),
      visibleOnUi: nullableInteger(row, "VisibleOnUI", sourceName, rowIndex),
    });
  }
}

function insertWeaponStats(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_weapon_stats (
      weapon_type, stat_type, stat_value, visible_on_ui
    ) VALUES (
      @weaponType, @statType, @statValue, @visibleOnUi
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      weaponType: textValue(row, "WeaponType", "Weapon.Info.csv", rowIndex),
      statType: textValue(row, "StatType", "Weapon.Info.csv", rowIndex),
      statValue: textValue(row, "StatValue", "Weapon.Info.csv", rowIndex),
      visibleOnUi: nullableInteger(
        row,
        "VisibleOnUI",
        "Weapon.Info.csv",
        rowIndex,
      ),
    });
  }
}

function insertWeaponStarBonuses(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_weapon_star_bonuses (
      id, weapon_type, collection_id, star_level, is_nft, damage_increase,
      stat_type, stat_value, fuse_price_id, fuse_item_count, fuse_reward_pool_id,
      dismantle_reward_pool_id, sacrifice_xp_multiplier, name_key,
      description_key, token_id, image_name, nft_name
    ) VALUES (
      @id, @weaponType, @collectionId, @starLevel, @isNft, @damageIncrease,
      @statType, @statValue, @fusePriceId, @fuseItemCount, @fuseRewardPoolId,
      @dismantleRewardPoolId, @sacrificeXpMultiplier, @nameKey,
      @descriptionKey, @tokenId, @imageName, @nftName
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      id: textValue(row, "ID", "Weapon.Data.csv", rowIndex),
      weaponType: textValue(row, "WeaponType", "Weapon.Data.csv", rowIndex),
      collectionId: textValue(row, "CollectionID", "Weapon.Data.csv", rowIndex),
      starLevel: nullableInteger(
        row,
        "StarLevel",
        "Weapon.Data.csv",
        rowIndex,
      ),
      isNft: booleanInteger(row, "IsNFT", "Weapon.Data.csv", rowIndex),
      damageIncrease: nullableNumber(
        row,
        "DamageIncrease",
        "Weapon.Data.csv",
        rowIndex,
      ),
      statType: nullableText(row, "StatType"),
      statValue: nullableNumber(row, "StatValue", "Weapon.Data.csv", rowIndex),
      fusePriceId: nullableText(row, "FusePriceID"),
      fuseItemCount: nullableNumber(
        row,
        "FuseItemCount",
        "Weapon.Data.csv",
        rowIndex,
      ),
      fuseRewardPoolId: nullableText(row, "FuseRewardPoolID"),
      dismantleRewardPoolId: nullableText(row, "DismantleRewardPoolID"),
      sacrificeXpMultiplier: nullableNumber(
        row,
        "SacrificeXPMultiplier",
        "Weapon.Data.csv",
        rowIndex,
      ),
      nameKey: nullableText(row, "NameID"),
      descriptionKey: nullableText(row, "DescriptionID"),
      tokenId: nullableText(row, "TokenID"),
      imageName: nullableText(row, "ImageName"),
      nftName: nullableText(row, "NFTName"),
    });
  }
}

function insertWeaponLevelUpgrades(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const sourceName = "Weapon.Levels.csv";
  const insert = db.prepare(`
    INSERT INTO gameplay_weapon_level_upgrades (
      level, xp_needed, free_weapon_price_id, nft_weapon_price_id,
      reward_pool_id
    ) VALUES (
      @level, @xpNeeded, @freeWeaponPriceId, @nftWeaponPriceId, @rewardPoolId
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      level: nullableInteger(row, "Level", sourceName, rowIndex),
      xpNeeded: nullableNumber(row, "XPNeeded", sourceName, rowIndex),
      freeWeaponPriceId: nullableText(row, "FreeWeaponPriceID"),
      nftWeaponPriceId: nullableText(row, "NFTWeaponPriceID"),
      rewardPoolId: nullableText(row, "RewardPoolID"),
    });
  }
}

function insertGameItems(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_game_items (
      item_id, name_key, category, is_tradable, rarity, color,
      inventory_sort_order, max_count, description_key
    ) VALUES (
      @itemId, @nameKey, @category, @isTradable, @rarity, @color,
      @inventorySortOrder, @maxCount, @descriptionKey
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      itemId: textValue(row, "ItemID", "GameItems.csv", rowIndex),
      nameKey: textValue(row, "NameID", "GameItems.csv", rowIndex),
      category: textValue(row, "Category", "GameItems.csv", rowIndex),
      isTradable: booleanInteger(row, "IsTradable", "GameItems.csv", rowIndex),
      rarity: nullableText(row, "Rarity"),
      color: nullableText(row, "Color"),
      inventorySortOrder: nullableNumber(
        row,
        "InventorySortOrder",
        "GameItems.csv",
        rowIndex,
      ),
      maxCount: nullableNumber(row, "MaxCount", "GameItems.csv", rowIndex),
      descriptionKey: nullableText(row, "DescriptionID"),
    });
  }
}

function insertPricePool(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_price_pool (
      row_index, id, platform, price_type, item_id, amount
    ) VALUES (
      @rowIndex, @id, @platform, @priceType, @itemId, @amount
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      rowIndex: index + 1,
      id: textValue(row, "ID", "PricePool.csv", rowIndex),
      platform: textValue(row, "Platform", "PricePool.csv", rowIndex),
      priceType: textValue(row, "PriceType", "PricePool.csv", rowIndex),
      itemId: nullableText(row, "ItemID"),
      amount: nullableNumber(row, "Amount", "PricePool.csv", rowIndex),
    });
  }
}

function insertRewardPool(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_reward_pool (
      row_index, id, rng_method, reward_type, reward_id, amount_min,
      amount_max, chance
    ) VALUES (
      @rowIndex, @id, @rngMethod, @rewardType, @rewardId, @amountMin,
      @amountMax, @chance
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      rowIndex: index + 1,
      id: textValue(row, "ID", "RewardPool.csv", rowIndex),
      rngMethod: textValue(row, "RNGMethod", "RewardPool.csv", rowIndex),
      rewardType: textValue(row, "RewardType", "RewardPool.csv", rowIndex),
      rewardId: nullableText(row, "RewardID"),
      amountMin: nullableNumber(row, "AmountMin", "RewardPool.csv", rowIndex),
      amountMax: nullableNumber(row, "AmountMax", "RewardPool.csv", rowIndex),
      chance: nullableNumber(row, "Chance", "RewardPool.csv", rowIndex),
    });
  }
}

function insertStatsDictionary(
  db: Database.Database,
  rows: Record<string, string>[] | undefined,
) {
  if (!rows) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO gameplay_stats_dictionary (
      stat_id, category, stacking_type, value_type, value_format_key,
      name_key, description_key
    ) VALUES (
      @statId, @category, @stackingType, @valueType, @valueFormatKey,
      @nameKey, @descriptionKey
    )
  `);

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    insert.run({
      statId: textValue(row, "StatID", "Stats.csv", rowIndex),
      category: textValue(row, "Category", "Stats.csv", rowIndex),
      stackingType: nullableText(row, "StackingType"),
      valueType: nullableText(row, "ValueType"),
      valueFormatKey: nullableText(row, "ValueFormatID"),
      nameKey: nullableText(row, "NameID"),
      descriptionKey: nullableText(row, "DescID"),
    });
  }
}

function insertTypedTables(db: Database.Database, files: GameplayCsvFile[]) {
  const bySource = rowsBySource(files);

  insertPerks(db, bySource.get("Perks.csv"));
  insertCharacterProfiles(db, bySource.get("Character.Info2.csv"));
  insertCharacterLevelUpgrades(db, bySource.get("Character.Levels.Info.csv"));
  insertCharacterTalents(db, bySource.get("Character.Talents.Info.csv"));
  insertCharacterLevels(db, bySource.get("Character.Levels.Stats.csv"));
  insertCharacterSkillStats(db, bySource.get("Character.Skills.Stats.csv"));
  insertWeaponStats(db, bySource.get("Weapon.Info.csv"));
  insertWeaponStarBonuses(db, bySource.get("Weapon.Data.csv"));
  insertWeaponLevelUpgrades(db, bySource.get("Weapon.Levels.csv"));
  insertGameItems(db, bySource.get("GameItems.csv"));
  insertPricePool(db, bySource.get("PricePool.csv"));
  insertRewardPool(db, bySource.get("RewardPool.csv"));
  insertStatsDictionary(db, bySource.get("Stats.csv"));
}

function tableCount(db: Database.Database, tableName: string) {
  return (
    db
      .prepare(`SELECT COUNT(*) AS total FROM ${quoteIdentifier(tableName)}`)
      .get() as { total: number }
  ).total;
}

export function summarizeGameplayData(db: Database.Database): GameplaySummary {
  const source = db
    .prepare(
      `
      SELECT COUNT(*) AS sourceFiles, COALESCE(SUM(row_count), 0) AS sourceRows
      FROM gameplay_source_files
    `,
    )
    .get() as { sourceFiles: number; sourceRows: number };

  return {
    sourceFiles: source.sourceFiles,
    sourceRows: source.sourceRows,
    perks: tableCount(db, "gameplay_perks"),
    characterProfiles: tableCount(db, "gameplay_character_profiles"),
    characterLevelUpgrades: tableCount(
      db,
      "gameplay_character_level_upgrades",
    ),
    characterTalents: tableCount(db, "gameplay_character_talents"),
    characterLevels: tableCount(db, "gameplay_character_levels"),
    characterSkillStats: tableCount(db, "gameplay_character_skill_stats"),
    weaponStats: tableCount(db, "gameplay_weapon_stats"),
    weaponStarBonuses: tableCount(db, "gameplay_weapon_star_bonuses"),
    weaponLevelUpgrades: tableCount(db, "gameplay_weapon_level_upgrades"),
    gameItems: tableCount(db, "gameplay_game_items"),
    priceRows: tableCount(db, "gameplay_price_pool"),
    rewardRows: tableCount(db, "gameplay_reward_pool"),
    statDefinitions: tableCount(db, "gameplay_stats_dictionary"),
  };
}

export function insertGameplayData(
  db: Database.Database,
  {
    gameDataDirectory,
  }: {
    gameDataDirectory?: string | null;
  } = {},
) {
  const files = gameDataDirectory ? readGameplayCsvFiles(gameDataDirectory) : [];

  const importGameplay = db.transaction(() => {
    dropExistingGameplayTables(db);
    createGameplayTables(db);
    insertSourceTables(db, files);
    insertTypedTables(db, files);
    return summarizeGameplayData(db);
  });

  return importGameplay();
}
