import math
import sys
import unittest
import warnings
from pathlib import Path

import pandas as pd

PRIVATE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PRIVATE_DIR))
warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL.*")

import multiversx_utils as mu  # noqa: E402


class MultiversxUtilsTest(unittest.TestCase):
    def test_normalise_key_uses_existing_camel_case_contract(self):
        self.assertEqual(mu._normalise_key("Reload Time"), "reloadTime")
        self.assertEqual(mu._normalise_key("talent_points_total"), "talentPointsTotal")

    def test_floor_price_filler_never_outputs_infinite_values(self):
        frame = pd.DataFrame(
            [
                {"name": "Liquid", "percent": 0.75, "floorPrice": 1.0},
                {"name": "ZeroShare", "percent": 0.0, "floorPrice": 0.0},
            ]
        )

        result = mu._fill_missing_floor_prices(frame, "name", "percent", 0.5)

        self.assertTrue(math.isfinite(result["ZeroShare"]["floorPrice"]))
        self.assertGreater(result["ZeroShare"]["floorPrice"], 0)

    def test_upgrade_costs_are_generated_from_game_data(self):
        characters, weapons = mu._load_upgrade_costs()

        self.assertEqual(
            characters["nft"]["20"],
            {"tokens": 8820, "shards": 94000, "crown": 460000},
        )
        self.assertEqual(
            weapons["nft"]["20"],
            {"tokens": 121200, "shards": 100000, "crown": 92000},
        )
        self.assertEqual(
            weapons["free"]["2"],
            {"tokens": 50, "shards": 2500, "crown": 0},
        )


if __name__ == "__main__":
    unittest.main()
