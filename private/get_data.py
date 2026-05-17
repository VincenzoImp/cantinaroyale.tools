from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import multiversx_utils as mu

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = REPO_ROOT / "public" / "data"
DEFAULT_COLLECTIONS = [
    "CRMYTH-546419",
    "CRWEAPONS-e5ab49",
    "GSPACEAPE-08bc2b",
    "CEA-2d29f9",
    "CRHEROES-9edff2",
]
COLLECTION_PARAMS = {
    "CRMYTH-546419": {
        "sleep_time": 0.6,
        "whitelist": ["https://metadata.cantinaroyale.io/dynamic/"],
    },
    "CRWEAPONS-e5ab49": {
        "sleep_time": 0.6,
        "whitelist": ["https://metadata.cantinaroyale.io/dynamic/"],
    },
    "GSPACEAPE-08bc2b": {
        "sleep_time": 0.2,
        "whitelist": ["https://metadata.verko.io/dynamic/"],
    },
    "CEA-2d29f9": {
        "sleep_time": 0.2,
        "whitelist": ["https://metadata.verko.io/dynamic/"],
    },
    "CRHEROES-9edff2": {
        "sleep_time": 0.6,
        "whitelist": [
            "https://metadata.cantinaroyale.io/dynamic/",
            "https://metadata.cantinaroyale.io/metadata/",
        ],
    },
}
MARKET_COLLECTIONS = {
    "genesis": ["CEA-2d29f9", "GSPACEAPE-08bc2b"],
    "heroes": ["CRHEROES-9edff2"],
    "weapons": ["CRWEAPONS-e5ab49", "CRMYTH-546419"],
}


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(f"{path.suffix}.tmp")
    temp_path.write_text(json.dumps(value, indent=4), encoding="utf-8")
    temp_path.replace(path)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def get_collection_info(collection_name: str, collection_dir: Path) -> None:
    collection_info = mu.get_collection_info(collection_name)
    if collection_info is None:
        raise RuntimeError(f"Collection not found: {collection_name}")
    write_json(collection_dir / "info.json", collection_info)


def get_collection_nfts_raw(
    collection_name: str,
    collection_dir: Path,
    sleep_time: float,
    whitelist: list[str],
) -> None:
    collection_nfts = mu.get_collection_nfts(collection_name, sleep_time=sleep_time)
    collection_offchain_data = mu.get_collection_offchain_data(
        collection_nfts,
        sleep_time=sleep_time,
        whitelist=whitelist,
    )

    for identifier, nft in collection_nfts.items():
        nft["offchainData"] = collection_offchain_data.get(identifier, {})

    write_json(collection_dir / "nfts_raw.json", collection_nfts)


def get_collection_nfts_processed(collection_dir: Path, *, keep_raw: bool) -> None:
    raw_path = collection_dir / "nfts_raw.json"
    collection_nfts = read_json(raw_path)
    processed = {
        identifier: mu.parse_nft_data(nft)
        for identifier, nft in collection_nfts.items()
    }
    write_json(collection_dir / "nfts.json", processed)

    if not keep_raw:
        raw_path.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Refresh Cantina Royale public/data snapshots.",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="Output data directory. Defaults to public/data.",
    )
    parser.add_argument(
        "--collections",
        nargs="+",
        default=DEFAULT_COLLECTIONS,
        help="Collection IDs to refresh.",
    )
    parser.add_argument("--skip-info", action="store_true")
    parser.add_argument("--skip-nfts", action="store_true")
    parser.add_argument("--skip-market", action="store_true")
    parser.add_argument(
        "--keep-raw",
        action="store_true",
        help="Keep generated nfts_raw.json files after processing.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = args.data_dir.resolve()

    for collection_name in args.collections:
        if collection_name not in COLLECTION_PARAMS:
            raise ValueError(f"Missing pipeline params for {collection_name}")

        collection_dir = data_dir / collection_name
        collection_dir.mkdir(parents=True, exist_ok=True)
        params = COLLECTION_PARAMS[collection_name]

        if not args.skip_info:
            get_collection_info(collection_name, collection_dir)
        if not args.skip_nfts:
            get_collection_nfts_raw(
                collection_name,
                collection_dir,
                params["sleep_time"],
                params["whitelist"],
            )
            get_collection_nfts_processed(collection_dir, keep_raw=args.keep_raw)

    if not args.skip_market:
        mu.add_market_data(data_dir, MARKET_COLLECTIONS)


if __name__ == "__main__":
    main()
