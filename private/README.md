# Private Data Pipeline

This folder contains the offline Python pipeline used to refresh the JSON
snapshot under `public/data`.

The app runtime does not import this Python code. Runtime validation happens
through the TypeScript SQLite builder in `scripts/data`.

Only maintained pipeline files live here:

- `get_data.py`: command line entrypoint.
- `multiversx_utils.py`: MultiversX, metadata and market helpers.
- `tests/`: Python unit tests for pipeline helpers.
- `requirements.txt`: direct Python dependencies for the pipeline.

Historical notebooks, generated charts and derived CSV exports were removed.
The source of truth for the app remains `public/data`.

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
