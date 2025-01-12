import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PUBLIC_COPY_FILES = [
  "src/app/layout.tsx",
  "src/app/not-found.tsx",
  "src/components/ErrorBoundary.tsx",
  "src/components/footer.tsx",
  "src/components/navbar-client.tsx",
  "src/features/collection/collection-columns.tsx",
  "src/features/collection/collection-page.tsx",
  "src/features/collection/collection-table.tsx",
  "src/features/collection/collection-toolbar.tsx",
  "src/features/home/home-dashboard.tsx",
  "src/features/nft/nft-detail.tsx",
  "src/features/search/search-box.tsx",
  "src/features/theme/theme-toggle.tsx",
  "src/server/data/sqlite-repository.ts",
];

const INTERNAL_COPY_PATTERNS = [
  /server-backed/i,
  /api-backed/i,
  /\bindexed\b/i,
  /tracked Cantina/i,
  /tracked collection/i,
  /tracked collections/i,
  /data snapshot/i,
  /indexed locally/i,
];

describe("public copy", () => {
  it("does not expose implementation language in user-facing text files", () => {
    const violations = PUBLIC_COPY_FILES.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return INTERNAL_COPY_PATTERNS.filter((pattern) => pattern.test(source)).map(
        (pattern) => `${file}: ${pattern}`,
      );
    });

    expect(violations).toEqual([]);
  });
});
