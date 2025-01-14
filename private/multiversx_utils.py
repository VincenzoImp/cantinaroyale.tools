from __future__ import annotations

import base64
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

MULTIVERSX_API_BASE = os.getenv("MULTIVERSX_API_BASE", "https://api.multiversx.com")
XOXNO_API_BASE = os.getenv("XOXNO_API_BASE", "https://api.xoxno.com")
XOXNO_ESCROW_ADDRESS = "erd1qqqqqqqqqqqqqpgq6wegs2xkypfpync8mn2sa5cmpqjlvrhwz5nqgepyg8"
DEFAULT_TIMEOUT = float(os.getenv("CANTINA_HTTP_TIMEOUT", "20"))
DEFAULT_RETRIES = int(os.getenv("CANTINA_HTTP_RETRIES", "5"))
DEFAULT_USER_AGENT = "cantinaroyale.tools-data-pipeline/1.0"


class PipelineError(RuntimeError):
    pass


@dataclass(frozen=True)
class RetryConfig:
    retries: int = DEFAULT_RETRIES
    sleep_time: float = 0.4
    timeout: float = DEFAULT_TIMEOUT


def _session() -> requests.Session:
    session = requests.Session()
    session.headers.update({"User-Agent": DEFAULT_USER_AGENT})
    return session


def _request_json(
    url: str,
    *,
    session: requests.Session | None = None,
    retry: RetryConfig | None = None,
    not_found_none: bool = True,
) -> Any:
    retry = retry or RetryConfig()
    session = session or _session()
    last_error: Exception | None = None

    for attempt in range(retry.retries + 1):
        try:
            response = session.get(url, timeout=retry.timeout)
            if response.status_code == 404 and not_found_none:
                return None
            if response.status_code == 429 or 500 <= response.status_code < 600:
                time.sleep(retry.sleep_time * (2**attempt))
                continue
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, json.JSONDecodeError) as error:
            last_error = error
            if attempt >= retry.retries:
                break
            time.sleep(retry.sleep_time * (2**attempt))

    raise PipelineError(f"Failed to fetch JSON from {url}") from last_error


def _write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(f"{path.suffix}.tmp")
    temp_path.write_text(json.dumps(value, indent=4), encoding="utf-8")
    temp_path.replace(path)


def clear_keys(dictionary: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    if not dictionary:
        return dictionary

    counts: dict[str, int] = {}
    for nft in dictionary.values():
        for key in nft:
            counts[key] = counts.get(key, 0) + 1

    required_count = len(dictionary)
    keys_to_remove = [key for key, count in counts.items() if count != required_count]
    for nft in dictionary.values():
        for key in keys_to_remove:
            nft.pop(key, None)

    return dictionary


def get_total_nfts(collection_name: str, sleep_time: float = 0.4) -> int | None:
    return _request_json(
        f"{MULTIVERSX_API_BASE}/collections/{collection_name}/nfts/count",
        retry=RetryConfig(sleep_time=sleep_time),
    )


def get_collection_info(
    collection_name: str,
    sleep_time: float = 0.4,
) -> dict[str, Any] | None:
    collection_info = _request_json(
        f"{MULTIVERSX_API_BASE}/collections/{collection_name}",
        retry=RetryConfig(sleep_time=sleep_time),
    )
    if collection_info is None:
        return None

    collection_info["totalNfts"] = get_total_nfts(collection_name, sleep_time)
    return collection_info


def get_nft(identifier: str, sleep_time: float = 0.4) -> dict[str, Any] | None:
    return _request_json(
        f"{MULTIVERSX_API_BASE}/nfts/{identifier}",
        retry=RetryConfig(sleep_time=sleep_time),
    )


def get_collection_nfts(
    collection_name: str,
    sleep_time: float = 0.4,
    page_size: int = 100,
) -> dict[str, dict[str, Any]]:
    collection_info = get_collection_info(collection_name, sleep_time)
    if collection_info is None:
        return {}

    total = int(collection_info.get("totalNfts") or 0)
    session = _session()
    collection_nfts: dict[str, dict[str, Any]] = {}
    previous_length = 0
    progress = tqdm(total=total, desc=f"get_collection_nfts('{collection_name}')")

    try:
        for order in ("asc", "desc"):
            for index in range(0, max(total, page_size) + page_size, page_size):
                url = (
                    f"{MULTIVERSX_API_BASE}/collections/{collection_name}/nfts"
                    f"?from={index}&size={page_size}&withOwner=true&sort=nonce&order={order}"
                )
                page = _request_json(
                    url,
                    session=session,
                    retry=RetryConfig(sleep_time=sleep_time),
                    not_found_none=False,
                )
                if not page:
                    break

                for nft in page:
                    if "owner" not in nft:
                        hydrated = get_nft(nft["identifier"], sleep_time)
                        if hydrated is not None:
                            nft = hydrated
                    collection_nfts[nft["identifier"]] = nft

                current_length = len(collection_nfts)
                progress.update(current_length - previous_length)
                previous_length = current_length
                if total and current_length >= total:
                    break
            if total and len(collection_nfts) >= total:
                break
    finally:
        progress.close()

    return dict(sorted(clear_keys(collection_nfts).items()))


def _decode_uri(uri: str) -> str | None:
    try:
        return base64.b64decode(uri).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return None


def _get_price(identifier: str, sleep_time: float) -> dict[str, Any]:
    price = _request_json(
        f"{XOXNO_API_BASE}/nft/{identifier}",
        retry=RetryConfig(sleep_time=sleep_time),
    )
    try:
        sale_info = price["saleInfo"]
        return {
            "currency": sale_info["paymentToken"],
            "amount": float(sale_info["minBidShort"]),
        }
    except (TypeError, KeyError, ValueError):
        return {"currency": None, "amount": None}


def get_collection_offchain_data(
    collection_nfts: dict[str, dict[str, Any]],
    sleep_time: float = 0.4,
    whitelist: list[str] | None = None,
    blacklist: list[str] | None = None,
) -> dict[str, dict[str, Any]]:
    blacklist = blacklist or [
        "https://ipfs.io/ipfs/",
        "https://gateway.pinata.cloud/ipfs/",
    ]
    if not collection_nfts:
        return {}

    session = _session()
    offchain_by_identifier: dict[str, dict[str, Any]] = {}
    collection_name = "-".join(next(iter(collection_nfts)).split("-")[:-1])
    progress = tqdm(
        total=len(collection_nfts),
        desc=f"get_collection_offchain_data('{collection_name}')",
    )

    try:
        for identifier, nft in collection_nfts.items():
            offchain_data: dict[str, Any] = {}
            for uri in nft.get("uris", []):
                url = _decode_uri(uri)
                if url is None:
                    continue
                if any(url.startswith(prefix) for prefix in blacklist):
                    offchain_data[url] = None
                    continue
                if whitelist is not None and not any(
                    url.startswith(prefix) for prefix in whitelist
                ):
                    offchain_data[url] = None
                    continue

                offchain_data[url] = _request_json(
                    url,
                    session=session,
                    retry=RetryConfig(sleep_time=sleep_time),
                    not_found_none=False,
                )

            if nft.get("owner") == XOXNO_ESCROW_ADDRESS:
                offchain_data["price"] = _get_price(identifier, sleep_time)
            else:
                offchain_data["price"] = {"currency": None, "amount": None}

            offchain_by_identifier[identifier] = offchain_data
            progress.update(1)
    finally:
        progress.close()

    return offchain_by_identifier


def _normalise_key(key: str) -> str:
    words = key.replace("_", " ").split(" ")
    camel = "".join(word[:1].upper() + word[1:] for word in words if word)
    return camel[:1].lower() + camel[1:] if camel else key


def _safe_dynamic_items(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        return {}
    game_data = data.get("gameData")
    if not isinstance(game_data, list) or not game_data:
        return {}
    dynamic_data = game_data[-1].get("dynamicData", {})
    return dynamic_data if isinstance(dynamic_data, dict) else {}


def parse_nft_data(nft: dict[str, Any]) -> dict[str, Any]:
    media = nft.get("media") or []
    metadata = nft.get("metadata") or {}
    collection = nft.get("collection")

    onchain_data: dict[str, Any] = {
        "identifier": nft.get("identifier"),
        "collection": collection,
        "name": nft.get("name"),
        "url": media[-1].get("url") if media else None,
        "thumbnailUrl": media[-1].get("thumbnailUrl") if media else None,
        "owner": nft.get("owner"),
        "rank": nft.get("rank"),
    }

    for attribute in metadata.get("attributes", []):
        onchain_data[attribute["trait_type"]] = attribute["value"]

    offchain = nft.get("offchainData") or {}
    price = offchain.get("price") or {}
    offchain_data: dict[str, Any] = {
        "priceCurrency": price.get("currency"),
        "priceAmount": price.get("amount"),
    }

    for url, data in offchain.items():
        if url == "price" or data is None:
            continue
        if collection in ["CRMYTH-546419", "CRWEAPONS-e5ab49"]:
            if url.startswith("https://metadata.cantinaroyale.io/dynamic/"):
                if isinstance(data, dict) and "stats" in data:
                    for attribute in data["stats"]:
                        offchain_data[attribute["name"]] = attribute["value"]
                elif isinstance(data, dict):
                    offchain_data.update(data)
        elif collection in ["CRCHAMPS-d0265d", "CRHEROES-9edff2"]:
            if url.startswith("https://metadata.cantinaroyale.io/metadata/"):
                for attribute in data.get("attributes", []):
                    offchain_data[attribute["trait_type"]] = attribute["value"]
            elif url.startswith("https://metadata.cantinaroyale.io/dynamic/"):
                for key, value in _safe_dynamic_items(data).items():
                    if key == "talents":
                        for attribute in value:
                            offchain_data[attribute["name"]] = attribute["value"]
                    else:
                        offchain_data[key] = value
        elif collection in ["GSPACEAPE-08bc2b", "CEA-2d29f9"]:
            if url.startswith("https://metadata.verko.io/dynamic/"):
                for key, value in _safe_dynamic_items(data).items():
                    if key == "talents":
                        for attribute in value:
                            offchain_data[attribute["name"]] = attribute["value"]
                    else:
                        offchain_data[key] = value

    nft_data = {**onchain_data, **offchain_data}
    return {
        _normalise_key(key): (value if value != "None" else None)
        for key, value in nft_data.items()
    }


def _game_data_path() -> Path:
    return Path(__file__).resolve().parent / "game_data"


def _price_amount(price_pool: pd.DataFrame, price_id: str, item_id: str) -> int:
    matches = price_pool[
        (price_pool["ID"] == price_id) & (price_pool["ItemID"] == item_id)
    ]["Amount"]
    if matches.empty:
        return 0
    return int(matches.astype(float).sum())


def _upgrade_entry(price_pool: pd.DataFrame, price_id: str, tokens: int) -> dict[str, int]:
    return {
        "tokens": int(tokens),
        "shards": _price_amount(price_pool, price_id, "Shards"),
        "crown": _price_amount(price_pool, price_id, "Crown"),
    }


def _load_upgrade_costs(
    game_data_path: str | Path | None = None,
) -> tuple[dict[str, dict[str, dict[str, int]]], dict[str, dict[str, dict[str, int]]]]:
    source_path = Path(game_data_path) if game_data_path is not None else _game_data_path()
    price_pool = pd.read_csv(source_path / "PricePool.csv")
    character_levels = pd.read_csv(source_path / "Character.Levels.Info.csv")
    weapon_levels = pd.read_csv(source_path / "Weapon.Levels.csv")

    characters = {"free": {}, "nft": {}}
    for row in character_levels.to_dict("records"):
        level = str(int(row["Level"]))
        tokens = int(row["RequiredTokens"])
        characters["free"][level] = _upgrade_entry(
            price_pool,
            row["FreeCharacterPriceID"],
            tokens,
        )
        characters["nft"][level] = _upgrade_entry(
            price_pool,
            row["NFTCharacterPriceID"],
            tokens,
        )

    weapons = {"free": {}, "nft": {}}
    for row in weapon_levels.to_dict("records"):
        level = str(int(row["Level"]))
        tokens = int(row["XPNeeded"])
        weapons["free"][level] = _upgrade_entry(
            price_pool,
            row["FreeWeaponPriceID"],
            tokens,
        )
        weapons["nft"][level] = _upgrade_entry(
            price_pool,
            row["NFTWeaponPriceID"],
            tokens,
        )

    return characters, weapons


def _crt_egld_rate() -> float:
    response = requests.get(
        "https://coindataflow.com/en/pair/crt-wegld",
        timeout=DEFAULT_TIMEOUT,
        headers={"User-Agent": DEFAULT_USER_AGENT},
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    script_tag = soup.find("script", type="application/ld+json")
    if script_tag is None or script_tag.string is None:
        raise PipelineError("Unable to read CRT/EGLD rate from CoinDataFlow")
    data = json.loads(script_tag.string)
    return float(data["currentExchangeRate"]["price"])


def add_market_data(data_folder_path: str | Path, collections: dict[str, list[str]]) -> None:
    data_path = Path(data_folder_path)
    characters_upgrade, weapons_upgrade = _load_upgrade_costs()
    crt_egld_rate = _crt_egld_rate()

    genesis = pd.concat(
        [
            pd.read_json(data_path / collection / "nfts.json", orient="index")
            for collection in collections["genesis"]
        ]
    )
    heroes = pd.concat(
        [
            pd.read_json(data_path / collection / "nfts.json", orient="index")
            for collection in collections["heroes"]
        ]
    )
    weapons = pd.concat(
        [
            pd.read_json(data_path / collection / "nfts.json", orient="index")
            for collection in collections["weapons"]
        ]
    )
    weapons = weapons[~weapons["starLevel"].isna()].copy()

    def character_value(floor_price: float, level: int, tokens: float) -> float:
        shards = crown = 0
        for current_level in range(1, int(level) + 1):
            shards += characters_upgrade["nft"][str(current_level)]["shards"]
            tokens += characters_upgrade["nft"][str(current_level)]["tokens"]
            crown += characters_upgrade["nft"][str(current_level)]["crown"]
        return floor_price + (shards + crown + tokens * 200) / 100 * crt_egld_rate

    def character_progress(level: int, tokens: float) -> float:
        max_level = 20
        max_tokens = sum(
            characters_upgrade["nft"][str(current_level)]["tokens"]
            for current_level in range(1, max_level + 1)
        )

        def value_at(current_level: int, current_tokens: float) -> float:
            shards = crown = 0
            for item_level in range(1, int(current_level) + 1):
                shards += characters_upgrade["nft"][str(item_level)]["shards"]
                current_tokens += characters_upgrade["nft"][str(item_level)]["tokens"]
                crown += characters_upgrade["nft"][str(item_level)]["crown"]
            current_tokens = min(current_tokens, max_tokens)
            return (shards + crown + current_tokens * 200) / 100 * crt_egld_rate

        return value_at(level, tokens) / value_at(max_level, 0) * 100

    def weapon_value(
        floor_price: float,
        star_level: int,
        level: int,
        tokens: float,
    ) -> float:
        shards_fusion = {1: 0, 2: 1000, 3: 6000, 4: 35000, 5: 100000, 6: 500000}
        shards = crown = 0
        for current_star in range(1, int(star_level) + 1):
            shards += shards_fusion[current_star]
        for current_level in range(1, int(level) + 1):
            shards += weapons_upgrade["nft"][str(current_level)]["shards"]
            crown += weapons_upgrade["nft"][str(current_level)]["crown"]
        return floor_price * (3 ** (int(star_level) - 1)) + (
            shards + crown + tokens * 50
        ) / 100 * crt_egld_rate

    def weapon_progress(level: int, tokens: float) -> float:
        max_level = 20
        max_tokens = weapons_upgrade["nft"][str(max_level)]["tokens"]

        def value_at(current_level: int, current_tokens: float) -> float:
            shards = crown = 0
            for item_level in range(1, int(current_level) + 1):
                shards += weapons_upgrade["nft"][str(item_level)]["shards"]
                crown += weapons_upgrade["nft"][str(item_level)]["crown"]
            current_tokens = min(current_tokens, max_tokens)
            return (shards + crown + current_tokens * 50) / 100 * crt_egld_rate

        return value_at(level, tokens) / value_at(max_level, max_tokens) * 100

    def character_floor_price(df: pd.DataFrame) -> dict[str, Any]:
        rarities = df.value_counts("rarityClass").reset_index()
        rarities["percent"] = rarities["count"] / rarities["count"].sum()
        onsale = df[(~df["priceAmount"].isna()) & (df["priceCurrency"] == "EGLD")]
        floor = (
            onsale.groupby("rarityClass")
            .agg({"priceAmount": "min"})
            .reset_index()
            .rename(columns={"priceAmount": "floorPrice"})
        )
        rarities = pd.merge(rarities, floor, on="rarityClass", how="outer").fillna(0)
        return _fill_missing_floor_prices(rarities, "rarityClass", "percent", 5)

    def weapon_floor_price(df: pd.DataFrame) -> dict[str, Any]:
        local_df = df.copy()
        local_df["countStarLevel1"] = local_df["starLevel"].apply(
            lambda value: 3 ** (int(value) - 1)
        )
        rarities = local_df.groupby("name").agg({"countStarLevel1": "sum"}).reset_index()
        onsale = local_df[
            (~local_df["priceAmount"].isna()) & (local_df["priceCurrency"] == "EGLD")
        ].copy()
        onsale["priceStarlevel1"] = onsale["priceAmount"] / onsale["countStarLevel1"]
        floor = (
            onsale.groupby("name")
            .agg({"priceStarlevel1": "min"})
            .reset_index()
            .rename(columns={"priceStarlevel1": "floorPrice"})
        )
        rarities = pd.merge(rarities, floor, on="name", how="outer").fillna(0)
        rarities["percent1*"] = rarities["countStarLevel1"] / rarities[
            "countStarLevel1"
        ].sum()
        rarities = rarities.rename(columns={"countStarLevel1": "count1*"})
        fallback = 1 if local_df["collection"].unique()[0] == "CRMYTH-546419" else 0.1
        return _fill_missing_floor_prices(
            rarities.sort_values("percent1*", ascending=False).reset_index(drop=True),
            "name",
            "percent1*",
            fallback,
        )

    market_data: dict[str, Any] = {
        "CRT/EGLD": crt_egld_rate,
        "floorPrice": {"genesis": {}, "heroes": {}, "weapons": {}},
    }

    for group_name, df in [("genesis", genesis), ("heroes", heroes)]:
        floor_price = character_floor_price(df)
        market_data["floorPrice"][group_name] = floor_price
        df = df.copy()
        df["value"] = df.apply(
            lambda row: character_value(
                floor_price[row["rarityClass"]]["floorPrice"],
                row["level"],
                row["characterTokens"],
            ),
            axis=1,
        )
        df["discount"] = np.where(
            (~df["priceAmount"].isna()) & (df["priceCurrency"] == "EGLD"),
            (df["priceAmount"] - df["value"]) / df["value"] * 100,
            np.nan,
        )
        df["progress"] = df.apply(
            lambda row: character_progress(row["level"], row["characterTokens"]),
            axis=1,
        )
        _write_collection_frames(data_path, df.sort_values("discount", ascending=True))

    for collection in weapons["collection"].unique():
        market_data["floorPrice"]["weapons"].update(
            weapon_floor_price(weapons[weapons["collection"] == collection])
        )
    weapons[["xp", "starLevel", "level"]] = weapons[["xp", "starLevel", "level"]].astype(
        int
    )
    weapons["value"] = weapons.apply(
        lambda row: weapon_value(
            market_data["floorPrice"]["weapons"][row["name"]]["floorPrice"],
            row["starLevel"],
            row["level"],
            row["xp"],
        ),
        axis=1,
    )
    weapons["discount"] = np.where(
        weapons["priceCurrency"] == "EGLD",
        (weapons["priceAmount"] - weapons["value"]) / weapons["value"] * 100,
        np.nan,
    )
    weapons["progress"] = weapons.apply(
        lambda row: weapon_progress(row["level"], row["xp"]),
        axis=1,
    )
    _write_collection_frames(data_path, weapons.sort_values("discount", ascending=True))
    _write_json(data_path / "market_data.json", market_data)


def _fill_missing_floor_prices(
    frame: pd.DataFrame,
    index_column: str,
    percent_column: str,
    fallback: float,
) -> dict[str, Any]:
    frame = frame.sort_values(percent_column, ascending=False).reset_index(drop=True)
    frame.loc[frame[percent_column] <= 0, "floorPrice"] = fallback
    while (frame["floorPrice"] == 0).any():
        if (frame["floorPrice"] > 0).any():
            for direction in (range(len(frame)), range(len(frame) - 1, -1, -1)):
                last = None
                for index in direction:
                    if frame.at[index, "floorPrice"] > 0:
                        last = index
                    elif last is not None:
                        current_percent = frame.at[index, percent_column]
                        frame.at[index, "floorPrice"] = (
                            fallback
                            if current_percent <= 0
                            else frame.at[last, percent_column]
                            / current_percent
                            * frame.at[last, "floorPrice"]
                        )
        else:
            frame.at[0, "floorPrice"] = fallback
    return frame.set_index(index_column).to_dict(orient="index")


def _write_collection_frames(data_path: Path, frame: pd.DataFrame) -> None:
    for collection in frame["collection"].unique():
        collection_frame = frame[frame["collection"] == collection]
        output = data_path / collection / "nfts.json"
        output.write_text(
            collection_frame.to_json(orient="index", indent=4),
            encoding="utf-8",
        )
