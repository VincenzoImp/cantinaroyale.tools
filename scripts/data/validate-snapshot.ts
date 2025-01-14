import { existsSync } from "node:fs";
import { buildSqliteDatabase } from "@/server/data/build";
import { SqliteCantinaRepository } from "@/server/data/sqlite-repository";
import { DEFAULT_DATABASE_PATH } from "@/server/data/paths";

const result = buildSqliteDatabase();

if (!existsSync(DEFAULT_DATABASE_PATH)) {
  throw new Error(`Expected SQLite database at ${DEFAULT_DATABASE_PATH}`);
}

const repository = new SqliteCantinaRepository(DEFAULT_DATABASE_PATH);
const stats = repository.getHomeStats();
const gameplay = repository.getGameplaySummary();
repository.close();

console.log(
  [
    `Validated ${result.collections} collections.`,
    `${stats.totalNfts.toLocaleString("en")} NFTs indexed.`,
    `${stats.listedNfts.toLocaleString("en")} listed assets.`,
    `${gameplay.sourceFiles} gameplay CSVs imported.`,
    `${gameplay.sourceRows.toLocaleString("en")} gameplay rows indexed.`,
  ].join(" "),
);
