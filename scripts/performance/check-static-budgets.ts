import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const STATIC_DIR = path.join(process.cwd(), ".next", "static");
const MAX_JS_BYTES = 300 * 1024;
const MAX_CSS_BYTES = 80 * 1024;
const FORBIDDEN_CLIENT_MARKERS = [
  "GSPACEAPE-08bc2b-1134",
  "CRWEAPONS-e5ab49-14ac",
  "GenesisSpaceApe #3199",
];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

const files = walk(STATIC_DIR).filter(
  (filePath) => filePath.endsWith(".js") || filePath.endsWith(".css"),
);

for (const filePath of files) {
  const size = statSync(filePath).size;
  const limit = filePath.endsWith(".js") ? MAX_JS_BYTES : MAX_CSS_BYTES;

  if (size > limit) {
    throw new Error(
      `${path.relative(process.cwd(), filePath)} is ${size} bytes; budget is ${limit} bytes.`,
    );
  }

  if (filePath.endsWith(".js")) {
    const contents = readFileSync(filePath, "utf8");
    const marker = FORBIDDEN_CLIENT_MARKERS.find((value) =>
      contents.includes(value),
    );
    if (marker) {
      throw new Error(
        `${path.relative(process.cwd(), filePath)} contains NFT data marker ${marker}.`,
      );
    }
  }
}

console.log(`Static budgets passed for ${files.length} client assets.`);
