# Private Data Pipeline

This folder contains the offline Python pipeline used to refresh the JSON
snapshot under `public/data`, plus the static gameplay database exports under
`private/game_data`.

The app runtime does not import this Python code. Runtime validation happens
through the TypeScript SQLite builder in `scripts/data`.

Only maintained private files live here:

- `get_data.py`: command line entrypoint.
- `multiversx_utils.py`: MultiversX, metadata and market helpers.
- `tests/`: Python unit tests for pipeline helpers.
- `requirements.txt`: direct Python dependencies for the pipeline.
- `game_data/*.csv`: canonical static gameplay balance tables imported into
  SQLite by the TypeScript data builder.

Historical notebooks, generated charts and derived CSV exports were removed.
The app source of truth is `public/data` for live NFT/market snapshots and
`private/game_data` for static gameplay tables.

## Refresh Snapshot

```bash
python private/get_data.py
npm run data:validate
npm run quality
```

Useful flags:

```bash
python private/get_data.py --collections CRMYTH-546419 CRWEAPONS-e5ab49
python private/get_data.py --skip-nfts
python private/get_data.py --keep-raw
```

Environment variables:

- `MULTIVERSX_API_BASE`, default `https://api.multiversx.com`
- `XOXNO_API_BASE`, default `https://api.xoxno.com`
- `CANTINA_HTTP_TIMEOUT`, default `20`
- `CANTINA_HTTP_RETRIES`, default `5`

The pipeline uses bounded retries and atomic JSON writes. It no longer depends on Selenium or `api.elrond.com`.
