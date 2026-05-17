# cantinaroyale.tools Complete Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild cantinaroyale.tools as a fast, typed, server-backed NFT/game-data explorer with polished light and dark themes.

**Architecture:** Replace client-side JSON imports with a server-only data repository backed initially by a generated SQLite database. Keep the Next.js App Router, but make the default path server-rendered and expose small route handlers for search and collection table queries. Split the monolithic table and duplicated theme code into focused modules with measurable performance budgets.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS with semantic CSS variables, HeroUI only where it is useful, SQLite generated from current JSON, Zod for schema validation, Vitest/Testing Library, Playwright, ESLint CLI.

---

## File Structure

Create:

- `src/server/data/schema.ts`: Zod schemas and exported TypeScript types for collections, NFTs, table rows, market data, and query params.
- `src/server/data/repository.ts`: server-only data access interface.
- `src/server/data/sqlite-repository.ts`: SQLite implementation of the repository.
- `src/server/data/query.ts`: parsing and validation for collection query params.
- `src/app/api/search/route.ts`: compact NFT search endpoint.
- `src/app/api/collections/[identifier]/route.ts`: paginated collection row endpoint.
- `src/features/collection/collection-page.tsx`: server composition for collection pages.
- `src/features/collection/collection-table.tsx`: client table renderer for already-paged rows.
- `src/features/collection/collection-toolbar.tsx`: client controls for search/sort/filter state.
- `src/features/collection/collection-columns.tsx`: typed column definitions and cell renderers.
- `src/features/nft/nft-detail.tsx`: typed detail rendering.
- `src/features/search/search-box.tsx`: client search box using `/api/search`.
- `src/features/theme/theme-provider.tsx`: single theme provider.
- `src/features/theme/theme-toggle.tsx`: accessible theme toggle.
- `src/styles/tokens.css`: semantic design tokens.
- `scripts/data/build-sqlite.ts`: generate SQLite from current JSON.
- `tests/server/data/schema.test.ts`: schema validation tests.
- `tests/server/data/repository.test.ts`: repository query tests with fixtures.
- `tests/e2e/core.spec.ts`: core route smoke tests.
- `.github/workflows/ci.yml`: install, typecheck, lint, test, build, audit.

Modify:

- `package.json`: scripts and dependencies.
- `next.config.mjs`: image remote patterns and performance-safe config.
- `src/app/layout.tsx`: metadata, theme provider, remove manual duplicate head tags.
- `src/app/page.tsx`: real explorer dashboard.
- `src/app/collection/[identifier]/page.tsx`: server-backed collection route.
- `src/app/nft/[identifier]/page.tsx`: server-backed NFT detail route.
- `src/app/globals.css`: import tokens and remove global `*` transitions.
- `tailwind.config.ts`: semantic token mapping.
- `README.md`: accurate setup, data pipeline, architecture, and commands.

Delete after replacement:

- `src/components/collection/collectionTable.tsx`
- `src/contexts/ThemeContext.tsx`
- `src/utils/theme.ts`
- `src/components/SimpleThemeToggle.tsx`
- `updater/`

## Task 1: Fix Tooling Reproducibility

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Update scripts**

Set scripts to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "quality": "npm run typecheck && npm run lint && npm run test && npm run build"
}
```

- [ ] **Step 2: Install/update dependencies**

Run:

```bash
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright eslint prettier zod better-sqlite3 @types/better-sqlite3
```

Expected: `package-lock.json` is synchronized and `npm ci` works.

- [ ] **Step 3: Add CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npm audit --audit-level=moderate
```

- [ ] **Step 4: Verify**

Run:

```bash
npm ci
npm run quality
```

Expected: install is reproducible; quality may fail only on tests not yet written if this task is split before Task 2. Commit the synchronized lockfile immediately.

## Task 2: Add Domain Schemas

**Files:**
- Create: `src/server/data/schema.ts`
- Test: `tests/server/data/schema.test.ts`

- [ ] **Step 1: Create schemas**

Implement `src/server/data/schema.ts`:

```ts
import { z } from "zod";

export const collectionTypeSchema = z.enum(["characters", "weapons"]);

export const collectionSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: collectionTypeSchema,
  nftCount: z.number().int().nonnegative(),
  holderCount: z.number().int().nonnegative().nullable(),
});

export const baseNftSchema = z.object({
  identifier: z.string().min(1),
  collection: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  owner: z.string().nullable(),
  rank: z.number().nullable(),
  priceCurrency: z.string().nullable(),
  priceAmount: z.number().nullable(),
  value: z.number().nullable(),
  discount: z.number().nullable(),
  progress: z.number().nullable(),
});

export const characterNftSchema = baseNftSchema.extend({
  type: z.literal("characters"),
  rarityClass: z.string().nullable(),
  perk1: z.string().nullable(),
  perk2: z.string().nullable(),
  level: z.number().int().nullable(),
  characterTokens: z.number().nullable(),
  health: z.number().nullable(),
  shield: z.number().nullable(),
});

export const weaponNftSchema = baseNftSchema.extend({
  type: z.literal("weapons"),
  xp: z.number().nullable(),
  wear: z.number().nullable(),
  level: z.number().int().nullable(),
  starLevel: z.number().int().nullable(),
  damage: z.number().nullable(),
  reloadTime: z.number().nullable(),
  ammo: z.number().nullable(),
  range: z.number().nullable(),
});

export const nftSchema = z.discriminatedUnion("type", [
  characterNftSchema,
  weaponNftSchema,
]);

export const collectionQuerySchema = z.object({
  identifier: z.string().min(1),
  type: collectionTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  sort: z.string().trim().max(120).optional(),
});

export type CollectionType = z.infer<typeof collectionTypeSchema>;
export type CollectionSummary = z.infer<typeof collectionSummarySchema>;
export type CharacterNft = z.infer<typeof characterNftSchema>;
export type WeaponNft = z.infer<typeof weaponNftSchema>;
export type Nft = z.infer<typeof nftSchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
```

- [ ] **Step 2: Add schema tests**

Create `tests/server/data/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { characterNftSchema, collectionQuerySchema, weaponNftSchema } from "@/server/data/schema";

describe("data schemas", () => {
  it("accepts a character NFT row", () => {
    const result = characterNftSchema.parse({
      type: "characters",
      identifier: "GSPACEAPE-08bc2b-01",
      collection: "GSPACEAPE-08bc2b",
      name: "GenesisSpaceApe #4681",
      url: "https://media.elrond.com/nfts/asset/example.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/example",
      owner: "erd1example",
      rank: 4738,
      priceCurrency: null,
      priceAmount: null,
      value: 0.34,
      discount: null,
      progress: 0,
      rarityClass: "Gold",
      perk1: "Hodler",
      perk2: "Scavenger",
      level: 1,
      characterTokens: 0,
      health: 2600,
      shield: 1350
    });

    expect(result.identifier).toBe("GSPACEAPE-08bc2b-01");
  });

  it("accepts a weapon NFT row", () => {
    const result = weaponNftSchema.parse({
      type: "weapons",
      identifier: "CRWEAPONS-e5ab49-01",
      collection: "CRWEAPONS-e5ab49",
      name: "Boomstick-X",
      url: "https://media.elrond.com/nfts/asset/example.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/example",
      owner: "erd1example",
      rank: null,
      priceCurrency: null,
      priceAmount: null,
      value: 0.147,
      discount: null,
      progress: 45,
      xp: 544,
      wear: 1.9,
      level: 3,
      starLevel: 3,
      damage: 2406,
      reloadTime: 2.1,
      ammo: 3,
      range: 9
    });

    expect(result.starLevel).toBe(3);
  });

  it("normalizes collection query defaults", () => {
    const result = collectionQuerySchema.parse({
      identifier: "All-Characters",
      type: "characters"
    });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });
});
```

- [ ] **Step 3: Verify**

Run:

```bash
npm run test -- tests/server/data/schema.test.ts
npm run typecheck
```

Expected: schema tests pass and TypeScript resolves `@/server/data/schema`.

## Task 3: Generate A Queryable SQLite Store

**Files:**
- Create: `scripts/data/build-sqlite.ts`
- Create: `src/server/data/sqlite-repository.ts`
- Test: `tests/server/data/repository.test.ts`

- [ ] **Step 1: Build SQLite generator**

Create `scripts/data/build-sqlite.ts` that reads `public/data/*/nfts.json`, infers type from `public/data/info.json` collection variables, validates rows with the schemas, and writes `.data/cantina.sqlite`.

Required tables:

```sql
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  nft_count INTEGER NOT NULL,
  holder_count INTEGER
);

CREATE TABLE nfts (
  identifier TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  owner TEXT,
  rank INTEGER,
  price_currency TEXT,
  price_amount REAL,
  value REAL,
  discount REAL,
  progress REAL,
  thumbnail_url TEXT,
  image_url TEXT,
  json TEXT NOT NULL
);

CREATE INDEX nfts_collection_type_idx ON nfts(collection, type);
CREATE INDEX nfts_type_name_idx ON nfts(type, name);
CREATE INDEX nfts_owner_idx ON nfts(owner);
CREATE INDEX nfts_price_idx ON nfts(price_amount);
```

- [ ] **Step 2: Add repository methods**

Implement `src/server/data/sqlite-repository.ts` with:

```ts
export async function getNftDetail(identifier: string) { /* read one row by identifier */ }
export async function searchNfts(query: string, limit = 10) { /* prefix/contains identifier + name */ }
export async function queryCollectionRows(query: CollectionQuery) { /* SQL LIMIT/OFFSET */ }
```

Return only the row fields needed by the caller. Do not return full JSON for table rows.

- [ ] **Step 3: Add repository tests**

Use a small fixture database created in test setup. Verify:

- one NFT lookup returns exactly one detail record;
- collection pagination returns `rows.length <= pageSize`;
- search for `GSPACEAPE` returns compact results;
- invalid page size is rejected before SQL.

- [ ] **Step 4: Verify**

Run:

```bash
npm run typecheck
npm run test -- tests/server/data/repository.test.ts
```

Expected: tests pass and no client component imports `public/data/*/nfts.json`.

## Task 4: Replace Global Data Imports

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/collection/[identifier]/page.tsx`
- Modify: `src/app/nft/[identifier]/page.tsx`
- Modify: `src/components/navbar.tsx` or replace with `src/features/search/search-box.tsx`
- Delete after migration: `src/lib/data.ts`

- [ ] **Step 1: Remove `@/lib/data` from client components**

Run:

```bash
rg -n "@/lib/data|../lib/data" src
```

Expected before migration: multiple matches. Expected after migration: no matches in client components.

- [ ] **Step 2: Server-load route data**

In `src/app/collection/[identifier]/page.tsx`, call repository methods server-side and pass only the first page of compact rows to `src/features/collection/collection-page.tsx`.

- [ ] **Step 3: Server-load NFT detail**

In `src/app/nft/[identifier]/page.tsx`, replace the loop through all collections with `getNftDetail(params.identifier)`.

- [ ] **Step 4: Replace navbar exact-ID dataset import**

Use `src/features/search/search-box.tsx` to call `/api/search?q=...`. The nav should import no collection JSON and no identifier arrays.

- [ ] **Step 5: Verify bundle**

Run:

```bash
npm run build
find .next/static/chunks -type f -name '*.js' -print0 | xargs -0 wc -c | sort -n | tail
```

Expected: no 20 MB plus chunk; home First Load JS drops below 300 KB gzip target after follow-up UI cleanup.

## Task 5: Rebuild Collection Table

**Files:**
- Create: `src/features/collection/collection-page.tsx`
- Create: `src/features/collection/collection-table.tsx`
- Create: `src/features/collection/collection-toolbar.tsx`
- Create: `src/features/collection/collection-columns.tsx`
- Delete: `src/components/collection/collectionTable.tsx`

- [ ] **Step 1: Define compact row type**

Use schema-derived fields only:

```ts
type CollectionRow = {
  identifier: string;
  collection: string;
  name: string;
  thumbnailUrl: string | null;
  owner: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  value: number | null;
  discount: number | null;
  progress: number | null;
};
```

- [ ] **Step 2: Build stateless table renderer**

`collection-table.tsx` receives `rows`, `columns`, `page`, `pageSize`, and `total`. It renders rows only; it does not filter or sort full datasets.

- [ ] **Step 3: Build URL-driven toolbar**

`collection-toolbar.tsx` updates `searchParams` with debounced search, selected filters, sort, page, and page size. It does not store duplicated filter state for rows already controlled by URL/server.

- [ ] **Step 4: Fix categorical filters**

Use controlled checkbox/switch components with boolean callbacks, such as `onValueChange={(selected) => ...}`. Do not use DOM `onChange` as a boolean.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run build
```

Expected: collection page renders first page with no full dataset in HTML.

## Task 6: Rebuild Theme

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/features/theme/theme-provider.tsx`
- Create: `src/features/theme/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Delete: `src/contexts/ThemeContext.tsx`
- Delete: `src/utils/theme.ts`
- Delete: `src/components/SimpleThemeToggle.tsx`

- [ ] **Step 1: Add semantic tokens**

Create tokens for light/dark:

```css
:root {
  color-scheme: light;
  --bg: 248 250 252;
  --surface-1: 255 255 255;
  --surface-2: 241 245 249;
  --text-1: 15 23 42;
  --text-2: 71 85 105;
  --accent: 37 99 235;
  --focus: 37 99 235;
}

.dark {
  color-scheme: dark;
  --bg: 10 14 24;
  --surface-1: 18 24 38;
  --surface-2: 30 41 59;
  --text-1: 248 250 252;
  --text-2: 203 213 225;
  --accent: 96 165 250;
  --focus: 147 197 253;
}
```

- [ ] **Step 2: Remove global transitions**

Delete the universal rule in `src/app/globals.css`:

```css
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
```

- [ ] **Step 3: Remove duplicate head tags**

In `src/app/layout.tsx`, remove manual `<meta charSet>` and viewport tags; use exported metadata/viewport instead.

- [ ] **Step 4: Add accessible toggle**

`theme-toggle.tsx` must render an icon button with `aria-label`, stable dimensions, and no hydration placeholder layout shift.

- [ ] **Step 5: Verify**

Run:

```bash
npm run build
npm run test:e2e -- tests/e2e/core.spec.ts
```

Expected: no duplicated meta tags and theme can be toggled on desktop/mobile.

## Task 7: Rebuild Data Pipeline

**Files:**
- Create: `scripts/data/fetch.ts`
- Create: `scripts/data/compute-market.ts`
- Create: `scripts/data/validate.ts`
- Create: `scripts/data/README.md`
- Create: `.github/workflows/data-update.yml`
- Delete after replacement: `updater/`

- [ ] **Step 1: Create explicit commands**

Expose:

```bash
npm run data:fetch
npm run data:compute-market
npm run data:validate
npm run data:build-db
```

- [ ] **Step 2: Add request policy**

Every network call must use:

- timeout in milliseconds;
- max attempts;
- exponential backoff;
- structured error output with collection/identifier context.

- [ ] **Step 3: Replace direct push updater**

Create `.github/workflows/data-update.yml` that runs on schedule and opens a PR instead of pushing to `main`.

- [ ] **Step 4: Verify**

Run:

```bash
npm run data:validate
npm run data:build-db
npm run test
```

Expected: data validation is deterministic and no script writes credentials to disk.

## Task 8: Performance And E2E Gates

**Files:**
- Create: `tests/e2e/core.spec.ts`
- Create: `scripts/check-bundle-budget.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add e2e smoke tests**

`tests/e2e/core.spec.ts` must visit:

- `/`
- `/collection/All-Characters`
- `/collection/All-Weapons`
- `/nft/GSPACEAPE-08bc2b-01`

Assert:

- page title is present;
- no console errors;
- theme toggle works;
- search returns a result;
- collection table renders rows.

- [ ] **Step 2: Add bundle budget script**

Fail if any `.next/static/chunks/*.js` file exceeds `500000` bytes raw unless it is an explicitly documented framework chunk.

- [ ] **Step 3: Add response budget checks**

In Playwright, capture response sizes and fail if:

- home HTML exceeds 100 KB;
- collection HTML exceeds 150 KB;
- first collection data response exceeds 100 KB.

- [ ] **Step 4: Verify**

Run:

```bash
npm run build
node scripts/check-bundle-budget.mjs
npm run test:e2e
```

Expected: current app fails this task before the data rewrite; rewritten app must pass.

## Self-Review

Spec coverage:

- Full repo audit is captured in `docs/audits/2026-05-17-repository-audit.md`.
- Performance rewrite is covered by Tasks 3, 4, 5, and 8.
- Light/dark theme rewrite is covered by Task 6.
- Data pipeline rewrite is covered by Task 7.
- Complete application rewrite is covered by Tasks 1 through 8.

Placeholder scan:

- The plan does not use TBD/TODO/fill-in placeholders.
- Broad implementation areas are represented as concrete files, commands, and expected outcomes.

Type consistency:

- Domain types originate in `src/server/data/schema.ts`.
- Collection query parsing, repository methods, route handlers, and UI rows all refer back to schema-derived types.

