import path from "node:path";

export const DEFAULT_DATA_DIRECTORY = path.join(process.cwd(), "public", "data");
export const DEFAULT_DATABASE_PATH = path.join(
  DEFAULT_DATA_DIRECTORY,
  "cantina.sqlite",
);
