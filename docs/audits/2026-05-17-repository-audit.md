# cantinaroyale.tools Repository Audit

Date: 2026-05-17

## Executive Summary

This repository is not mainly suffering from isolated bugs. It is architecturally inverted for the product it wants to be: large NFT datasets are imported as application code, then shipped to the browser and serialized into server-rendered HTML. A complete rewrite is justified.

The current app is a Next.js 14 App Router site with HeroUI, Tailwind, static JSON data in `public/data`, and private Python notebooks/scripts that regenerate the data. It builds, but the successful build exposes the core performance failure:

- `npm run build`: passes after a non-lockfile install.
- Home route First Load JS: `2.1 MB`.
- Collection route First Load JS: `2.21 MB`.
- Largest generated client chunk: `.next/static/chunks/13-f70fc23ffb8ae9f7.js`, `25,177,072` bytes raw, about `2,064,326` bytes gzip.
- `/collection/All-Characters` HTML response from `next start`: `25,572,634` bytes.
- Public NFT JSON: `35,439,826` bytes raw. `GSPACEAPE-08bc2b/nfts.json` alone is `26,820,401` bytes.
- Total NFT rows currently loaded from public JSON: `20,413`.

The rewrite should prioritize data access, payload control, table architecture, and theme/design system before adding features.

## What The Code Currently Does

- `src/app/page.tsx` renders a simple marketing-like home page with nav, CTA links, three feature cards, and footer.
- `src/app/collection/[identifier]/page.tsx` accepts known collection IDs or aggregate IDs (`All-Characters`, `All-Weapons`), builds an object of collection data from `src/lib/data.ts`, and renders a character or weapon collection table.
- `src/app/nft/[identifier]/page.tsx` loops through all loaded collection data, finds an NFT by identifier, and renders a character or weapon detail card.
- `src/lib/data.ts` imports `public/data/info.json`, imports game-data JSON files, dynamically `require`s every collection `info.json` and every `nfts.json`, and exports `data` and `identifiers`.
- `src/components/navbar.tsx` imports all NFT identifiers and provides exact-ID search.
- `src/components/collection/collectionTable.tsx` is a 1,418-line client component that handles table rendering, filtering, sorting, URL state, localStorage presets, pagination, and cell formatting.
- `private/get_data.py`, `private/multiversx_utils_2.py`, and notebooks fetch blockchain/offchain data, parse it, compute market values, and write JSON into `public/data`.
- `updater/` contains a Docker-based infinite loop that clones the repo, runs the private data script daily, commits all changes, and pushes to `main`.

## Critical Findings

### 1. Fatal Data Bundling And RSC Payload Explosion

Evidence:

- `src/lib/data.ts:13-26` loads every configured collection with dynamic `require`.
- `src/lib/data.ts:75-76` exports `data = loadCollectionData()` and `identifiers = loadIdentifiers()`.
- `src/lib/data.ts:54-76` calls `loadCollectionData()` again just to build identifiers.
- `src/components/navbar.tsx:3` imports `identifiers`, so the global nav pulls all NFT IDs into routes that only need navigation.
- `src/app/collection/[identifier]/page.tsx:80-102` passes `collectionData` into a client table path.
- `src/components/collection/characterCollection.tsx:17-30` and `src/components/collection/weaponCollection.tsx:17-26` flatten all NFT objects into `tableEntries`.
- `src/components/collection/collectionTable.tsx:1` marks the table as client code, so the large `tableEntries` prop must be serialized to the client.

Measured result:

- The generated client chunk contains literal NFT JSON (`GSPACEAPE`, `CRWEAPONS`, `CRHEROES`, etc.).
- The home page references that same 25 MB raw chunk because the navbar imports identifiers.
- `/collection/All-Characters` returns about 25.6 MB of HTML because the RSC payload serializes all table rows.

Impact:

- Slow initial load, slow hydration, high memory use, high parse/compile cost, bad mobile performance.
- The browser receives far more data than it can display.
- The home page pays the data cost of the explorer.

Required rewrite direction:

- Never import full NFT datasets from React components.
- Move collection browsing behind server-side data access with pagination, filtering, sorting, and search.
- Store data in a queryable store: SQLite for static/server deployments, Postgres for hosted dynamic deployments, or generated columnar/index files with route handlers.
- Split data shapes: collection summary, table row, NFT detail, search index, and game-data reference.

### 2. Collection Table Does Too Much On The Client

Evidence:

- `src/components/collection/collectionTable.tsx:300-402` copies, filters, range-filters, and sorts all rows in `useMemo`.
- `src/components/collection/collectionTable.tsx:283-297` scans all `tableEntries` to compute unique filter values.
- `src/components/collection/collectionTable.tsx:817` recomputes unique values while rendering a filter dropdown.
- `src/components/collection/collectionTable.tsx:1356-1359` slices after all filtering/sorting work is complete.
- `src/components/collection/collectionTable.tsx:219-223` updates URL state on every state change, including keystrokes.
- `src/components/collection/collectionTable.tsx:1196` reaches into the DOM with `document.getElementById`.

Impact:

- Pagination is visual only; it does not reduce data transfer or compute.
- Filters and sort scale with total collection size, not visible rows.
- The component is too large to maintain safely.

Required rewrite direction:

- Use server-backed filtering/sorting/pagination.
- Keep table state in URL query params, but debounce search and validate params server-side.
- Use a table primitive only for rendering and controlled state, not as a data engine over 20k full objects in the browser.
- Consider TanStack Table + TanStack Virtual for rendering, but keep querying server-side.

### 3. Search Is Exact-ID Only But Ships All Identifiers

Evidence:

- `src/components/navbar.tsx:23-41` loops through every collection and uses `includes` against identifier arrays.
- `src/lib/data.ts:54-76` builds identifiers by loading all collection data.

Impact:

- Home/nav downloads all identifiers.
- Search is expensive relative to its limited behavior.
- No fuzzy matching, no owner/name/token search, no command palette, no collection-aware suggestions.

Required rewrite direction:

- Build a compact search index: `identifier -> collection/type/name/thumbnail`.
- Serve suggestions from `/api/search?q=...` with a small response budget.
- Keep exact-ID navigation as a fast path, but do not bundle all identifiers into nav.

### 4. NFT Detail Lookup Is Server-Inefficient And Still Bundles All Data

Evidence:

- `src/app/nft/[identifier]/page.tsx:20-22` loops over all `data` collections and checks each `nfts` object.
- `src/app/nft/[identifier]/page.tsx:22` types the NFT as `{ [key: string]: any }`.
- `src/components/nft/nftCard.tsx:220` sets `unoptimized` on `next/image`.
- `next.config.mjs` is empty, so remote image optimization is not configured.

Impact:

- Every NFT request loads the whole dataset into the server bundle.
- The client chunk still contains all datasets.
- Images bypass Next optimization.

Required rewrite direction:

- Resolve NFT by identifier in a server data module or route handler.
- Configure image `remotePatterns` for known hosts and remove `unoptimized` unless there is a precise reason.
- Precompute and serve NFT detail records independently from table rows.

### 5. Theme System Is Duplicated, Global, And Not Design-Grade

Evidence:

- `src/app/layout.tsx:17-30` injects a manual inline theme script.
- `src/contexts/ThemeContext.tsx:21-33` repeats initial theme detection after mount.
- `src/utils/theme.ts:62-102` contains a third theme utility path that is not the actual provider.
- `src/app/globals.css:37-40` applies color/background/border transitions to every element.
- `tailwind.config.ts:7-34` and `src/app/globals.css:7-35` define overlapping token systems.
- There are hundreds of hardcoded gray/blue/dark classes across components instead of semantic tokens.

Impact:

- Theme behavior is fragile and visually generic.
- Global transitions add style work across large tables.
- Dark mode is not a coherent design system; it is mostly `dark:bg-gray-*` patches.
- Light mode is also generic and lacks Cantina Royale identity.

Required rewrite direction:

- Use one theme source, preferably `next-themes` or a small server-safe provider with a nonce-compatible no-flash script.
- Define semantic CSS tokens: `--bg`, `--surface-1`, `--surface-2`, `--text-1`, `--text-2`, `--accent`, `--danger`, `--success`, `--focus`.
- Add `color-scheme: light dark`.
- Replace per-component hardcoded grays/blues with tokens.
- Remove global `*` transitions; transition only interactive surfaces.

### 6. UI/UX Is Not Product-Grade For The Domain

Evidence:

- `src/app/page.tsx:20-114` is a generic feature-card page, not an immediately useful explorer/dashboard.
- `public/images` contains Cantina assets, but the app barely uses visual assets in the product UI.
- `collectionTable.tsx` uses many nested cards, `rounded-2xl`, shadows, badges, and emoji controls, making the operational table visually noisy.
- Raw collection IDs are used as primary labels in nav and headings.

Impact:

- The first screen does not show live utility.
- The UI feels generic and cluttered.
- The product misses obvious workflows: compare NFTs, inspect market opportunities, view rarity/game stats, filter by sale/value/progress, save/share views.

Required rewrite direction:

- Make the first screen a usable explorer dashboard, not a landing page.
- Use actual Cantina imagery in controlled, performant places.
- Build dense, scan-friendly views for repeated analysis.
- Treat character/weapon collections as distinct product surfaces with tailored stats.

### 7. Accessibility And Semantics Need Rework

Evidence:

- `src/app/layout.tsx:14-16` manually renders charset and viewport; rendered HTML also includes Next-generated charset and viewport, so duplicates appear.
- `src/components/navbar.tsx:149-154` renders popover buttons directly inside a `ul` instead of `li` children.
- `src/components/navbar.tsx:166-173` mobile menu button has no accessible label.
- `src/components/navbar.tsx:137-145` toast close button has no accessible label.
- `src/components/nft/nftCard.tsx:177-181` renders tab-like buttons without tablist/tab/tabpanel semantics.
- `src/app/page.tsx:59-99` uses emoji icons without accessibility treatment.

Impact:

- Invalid list semantics.
- Screen reader navigation is weak.
- Keyboard/focus expectations are not consistently explicit.

Required rewrite direction:

- Use semantic nav/list structure.
- Add aria labels for icon buttons.
- Use accessible tabs, dialogs, combobox/search, and table controls.
- Run automated a11y checks in CI.

### 8. Type Safety Is Superficial

Evidence:

- `src/types/index.ts:15-18` models `nfts` as `Record<string, any>`.
- `src/types/index.ts:56`, `src/types/index.ts:63`, `src/types/index.ts:67`, and many component props use `any`.
- `src/types/table.ts:8` and `src/types/table.ts:25` preserve the typo `rangeble`.
- `src/components/collection/collectionTable.tsx:28-62` redeclares local table types instead of using shared domain types.
- `tsconfig.json` enables `strict`, but also uses `allowJs` and `skipLibCheck`.

Impact:

- TypeScript cannot protect the data model.
- Schema drift in JSON is invisible until runtime.
- The app has no runtime validation for external/generated data.

Required rewrite direction:

- Define `CharacterNft`, `WeaponNft`, `CollectionSummary`, `TableRow`, `NftDetail`, `MarketData`.
- Validate generated JSON or database rows with Zod/Valibot at pipeline boundaries.
- Generate types from schema where practical.

### 9. Concrete Bugs And Correctness Issues

- `src/components/collection/collectionTable.tsx:823-829`: HeroUI `Switch` should use `onValueChange` for boolean state. Current `onChange` receives an event object, which is truthy, so toggling a categorical filter tends to add rather than remove.
- `src/components/collection/collectionTable.tsx:272-277` plus `src/components/collection/collectionTable.tsx:1032`: display formatting rounds every numeric value to two decimals, including ranks and levels.
- `src/components/nft/nftCard.tsx:20-22` and `src/components/nft/nftCard.tsx:79-81`: `parseFloat(value)` is used as truthiness, so `0` is skipped and numeric-looking strings can be misinterpreted.
- `src/components/navbar.tsx:135`: `top-30` is not a default Tailwind class.
- `src/app/not-found.tsx:9`: `md:text-16xl` is not a default Tailwind class.
- `src/components/navbar.tsx:128`: `focus:ring-theme-primary` is not defined by the custom utilities.
- `src/components/collection/characterCollection.tsx:23-26`: `tableFilters` is built and never used.
- `src/components/radarChart.tsx` and `src/components/icon/*` appear unused in the current app.

### 10. Data Pipeline Is Fragile And Unsafe Operationally

Evidence:

- `private/get_data.py:5-13` hardcodes paths, collections, and operations at module top level.
- `private/get_data.py:78-98` executes work at import/runtime without a CLI entrypoint.
- `private/multiversx_utils_2.py:31-47`, `private/multiversx_utils_2.py:68-84`, and `private/multiversx_utils_2.py:216-267` use broad exception handling and retry loops with no max retries or request timeouts.
- `private/multiversx_utils_2.py:516-522` scrapes a third-party HTML page for CRT/EGLD rate.
- `updater/script.sh:12` writes a GitHub token into `~/.git-credentials`.
- `updater/script.sh:18` deletes the repo directory.
- `updater/script.sh:41` runs `git add .`.
- `updater/script.sh:45-47` commits and pushes directly to `main`.
- `updater/Dockerfile:2` uses `ubuntu:latest`.

Impact:

- Data jobs can hang forever.
- Secrets may remain on disk if the script exits before cleanup.
- The updater can commit unwanted generated files or environment artifacts.
- Reproducibility is weak.

Required rewrite direction:

- Replace notebooks/updater loop with a tested CLI pipeline and scheduled CI job.
- Use request timeouts, bounded retries, typed schemas, structured logs, and atomic output.
- Open PRs for data updates instead of direct pushes to `main`.
- Pin Docker images and dependency versions.

### 11. Dependencies And Build Reproducibility Are Broken

Evidence:

- `npm ci` fails because `package.json` and `package-lock.json` are out of sync.
- Example mismatch: `package.json` requires `eslint-config-next@14.2.35`, while the lock contains `14.2.3`.
- `npm audit --audit-level=moderate` against the lock reports 12 vulnerabilities: 3 moderate, 9 high.
- After `npm install --no-package-lock`, npm reports 5 vulnerabilities: 1 moderate, 4 high.
- `package.json:8` uses `next lint`, which is a migration liability because newer Next versions removed that command.
- There are no test scripts, no typecheck script, no formatter script, and no CI config.

Required rewrite direction:

- Synchronize lockfile immediately.
- Upgrade to a current supported Next/React stack as part of the rewrite.
- Replace `next lint` with ESLint CLI config.
- Add `typecheck`, `lint`, `test`, `test:e2e`, and performance-budget scripts.

## Complete Rewrite Plan

### Target Architecture

- Framework: current Next.js App Router, React, TypeScript strict.
- Data store: start with SQLite generated from source data for simple deploys; keep a repository interface that can later target Postgres.
- Data access: server-only modules and route handlers. No full NFT JSON imports in client components.
- UI: server-rendered shell, client islands only for filters, table controls, search, theme toggle, and detail interactions.
- Table: server-backed pagination/filtering/sorting, URL-driven state, optional virtualization for large visible pages.
- Theme: semantic token system with polished light and dark modes.
- Pipeline: deterministic `scripts/data` CLI with tests, schemas, and scheduled PR-based updates.

### Phase 0: Stabilize The Existing Repo

1. Synchronize `package-lock.json` and choose one package manager.
2. Add scripts: `typecheck`, `lint`, `test`, `build`, `audit`.
3. Add CI running install, typecheck, lint, tests, build, and audit.
4. Add baseline smoke tests for `/`, `/collection/All-Characters`, `/collection/All-Weapons`, and one NFT detail route.
5. Add bundle/performance budget checks so the current 25 MB chunk cannot regress silently.

### Phase 1: Define Data Contracts

1. Create canonical schemas for raw NFT, character NFT, weapon NFT, collection summary, market data, table row, and NFT detail.
2. Validate current JSON against those schemas and document invalid/null fields.
3. Create a migration script that reads current `public/data` and writes a normalized database or generated index files.
4. Separate public assets from data source files; keep generated artifacts out of React imports.

### Phase 2: Rebuild Data Access

1. Create `src/server/data` with server-only repository functions:
   - `getCollectionSummary(collectionId)`
   - `queryCollectionRows({ collectionIds, type, filters, sort, page, pageSize })`
   - `getNftDetail(identifier)`
   - `searchNfts(query, limit)`
2. Add route handlers for search and table data.
3. Make route params validated and canonicalized.
4. Ensure every API response has a size budget.

### Phase 3: Rebuild Frontend Surfaces

1. Replace home with a real explorer dashboard: collection cards, market highlights, search, recently updated data timestamp, and quick filters.
2. Rebuild collection pages around server-backed table state.
3. Rebuild NFT detail pages with typed sections, optimized remote images, stat comparison, market/value breakdown, and related NFTs.
4. Remove the monolithic `collectionTable.tsx`; split into focused modules:
   - `collection-query-schema.ts`
   - `collection-toolbar.tsx`
   - `collection-table.tsx`
   - `collection-filter-menu.tsx`
   - `collection-columns.tsx`
   - `collection-pagination.tsx`
5. Replace localStorage preset logic with versioned saved views stored in URL first; localStorage can be optional progressive enhancement.

### Phase 4: Rebuild Theme And Design System

1. Define a Cantina-specific visual direction instead of generic blue/gray admin styling.
2. Build semantic CSS variables for light/dark and use them everywhere.
3. Remove global `*` transitions.
4. Use actual game/NFT imagery in the dashboard and detail pages with strict image sizing.
5. Use icons from a maintained icon set instead of ad hoc inline SVG/emoji controls.
6. Create accessible focus, hover, disabled, loading, empty, and error states.

### Phase 5: Rebuild The Data Pipeline

1. Convert `private/get_data.py` into a CLI with explicit commands:
   - `fetch-collections`
   - `fetch-offchain`
   - `compute-market`
   - `build-db`
   - `validate`
2. Add request timeouts, bounded retries, and structured logs.
3. Replace broad `except: pass` with typed failure handling.
4. Pin Python dependencies with hashes or use `uv.lock`.
5. Replace the Docker infinite loop with GitHub Actions scheduled workflow that opens PRs.
6. Add pipeline tests using small fixture datasets.

### Phase 6: Performance Targets

- Home initial JS: under 250 KB gzip.
- Collection initial HTML: under 100 KB.
- Collection first data response: under 100 KB.
- NFT detail response: under 150 KB including initial data.
- No route should ship full collection JSON.
- Client-side table interactions: under 100 ms on mid-range hardware.
- LCP target: under 2.5 seconds on mobile.
- INP target: under 200 ms.

## Keep, Rewrite, Remove

Keep:

- The core domain idea: NFT explorer plus game stats and market/value tooling.
- Current public data as migration input.
- Some copy/config values from `public/data/info.json`.

Rewrite:

- Data loading architecture.
- Collection table.
- NFT detail page.
- Theme system.
- Navigation/search.
- Data pipeline/updater.
- README and developer workflow.

Remove:

- Client imports of full datasets.
- `collectionTable.tsx` as a monolith.
- Duplicate theme utilities.
- Unused icons/RadarChart unless they are reintroduced intentionally.
- The Docker direct-push updater pattern.
- Marketing claims for features not actually implemented.

## Verification Commands Run

- `rg --files` and `find` to map the repo.
- Full source reads for `src`, config files, updater scripts, private Python scripts, notebooks, and data summaries.
- `npm ci`: failed due package-lock/package mismatch.
- `npm install --no-package-lock`: installed dependencies without changing tracked files.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, but reported `2.1 MB` to `2.21 MB` First Load JS.
- `npm audit --audit-level=moderate`: failed with vulnerabilities.
- `next start -p 3001` plus `curl` measurements for `/`, `/collection/All-Characters`, `/nft/GSPACEAPE-08bc2b-01`, and the largest chunk.

