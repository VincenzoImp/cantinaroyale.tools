# Cantina Royale Tools

Public explorer for Cantina Royale NFT collections, characters, weapons,
rarity, perks, gameplay charts, upgrade economy and live market context.

Live site: <https://cantinaroyale-tools.vercel.app/>

## What It Does

Cantina Royale Tools helps players and collectors explore the Cantina Royale
ecosystem without loading massive NFT datasets in the browser.

- Browse all supported character and weapon collections.
- Search NFTs by name, collection, trait or owner.
- Filter collection tables by sale status, rarity, perks, level, stars, price,
  rank, estimated value and progress.
- Open detailed NFT pages with market data, ownership, gameplay stats,
  appearance traits and perk/stat bonuses.
- Review curated game data views for character growth, weapon balance and
  upgrade economy.
- Compare aggregate home insights for market overview, character traits and
  weapon star ratings.
- Use a polished light/dark theme with the theme switch in the footer.

## Supported Collections

The current snapshot covers:

- `GSPACEAPE-08bc2b`
- `CEA-2d29f9`
- `CRHEROES-9edff2`
- `CRWEAPONS-e5ab49`
- `CRMYTH-546419`

Collection definitions live in `public/data/info.json`.

## Architecture

The app is built around a server-side SQLite data layer. NFT and market
snapshots live as JSON under `public/data`; gameplay balance exports live under
`private/game_data`. `npm run data:build-db` validates both sources and creates
the derived database at `public/data/cantina.sqlite`.

Runtime flow:

1. `scripts/data/build-sqlite.ts` reads the public JSON snapshot.
2. `src/server/data/gameplay.ts` imports the gameplay exports and materializes
   typed gameplay/economy tables.
3. `src/server/data/build.ts` normalizes and validates NFT rows.
4. `src/server/data/sqlite-repository.ts` serves compact queries.
5. App Router pages render lightweight initial payloads.
6. `/api/search` and `/api/collections/[identifier]` power interactive search,
   pagination, sorting and filtering.

The SQLite build is atomic: a new database is written to a temporary file and
only replaces the current database after a successful build.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS with semantic light/dark tokens
- SQLite via `better-sqlite3`
- Zod schemas
- Vitest and Testing Library
- Playwright
- ESLint flat config
- Vercel deployment

## Local Development

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

`npm run dev`, `npm run build` and `npm run start` build the SQLite database
first through npm lifecycle hooks.

## Production Build

```bash
npm run build
npm run start
```

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run data:validate
npm run private:check
npm audit --audit-level=moderate
```

Full local gate:

```bash
npm run quality
```

## Data Refresh

The maintained offline Python pipeline lives in `private/`. It refreshes the
NFT JSON snapshot under `public/data`.

```bash
python private/get_data.py
npm run data:validate
npm run quality
```

Useful refresh flags:

```bash
python private/get_data.py --collections CRMYTH-546419 CRWEAPONS-e5ab49
python private/get_data.py --skip-nfts
python private/get_data.py --keep-raw
```

Data changes should be reviewed like normal source changes:

1. Refresh or edit the JSON snapshot under `public/data`.
2. Refresh `private/game_data/*.csv` only from canonical gameplay database
   exports.
3. Run `npm run data:validate`.
4. Run `npm run quality`.
5. Open a pull request with the snapshot changes and validation output.

## Project Layout

```text
src/app/                         App Router pages and API routes
src/components/                  Shared layout components
src/features/collection/          Collection table, filters and columns
src/features/home/                Home dashboard and aggregate views
src/features/nft/                 NFT detail pages
src/features/search/              Search UI
src/features/theme/               Light/dark theme system
src/server/data/                  Schemas, gameplay import and SQLite repository
src/styles/tokens.css             Semantic theme tokens
scripts/data/                     SQLite build and snapshot validation
scripts/performance/              Static asset budget checks
private/                          Offline refresh pipeline and gameplay CSV sources
tests/                            Unit, UI, API and e2e tests
```

## Performance Notes

Collection pages fetch only the current table page. Full trait payloads are
reserved for NFT detail pages. This keeps home and collection routes responsive
and avoids sending the full NFT corpus to the browser.
