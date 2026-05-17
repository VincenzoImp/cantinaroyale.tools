import { buildSqliteDatabase } from "@/server/data/build";

const result = buildSqliteDatabase();

console.log(
  `Built ${result.outputPath} from ${result.collections} tracked collections.`,
);
