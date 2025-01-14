import { buildSqliteDatabase } from "@/server/data/build";

const result = buildSqliteDatabase();

console.log(
  [
    `Built ${result.outputPath} from ${result.collections} tracked collections.`,
    `Imported ${result.gameplay.sourceFiles} gameplay CSVs with ${result.gameplay.sourceRows.toLocaleString("en")} rows.`,
  ].join(" "),
);
