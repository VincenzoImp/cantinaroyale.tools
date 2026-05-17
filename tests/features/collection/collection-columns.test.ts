import { describe, expect, it } from "vitest";
import {
  formatCellValue,
  getCollectionColumns,
} from "@/features/collection/collection-columns";

describe("collection columns", () => {
  it("uses focused columns per collection type", () => {
    expect(getCollectionColumns("characters").map((column) => column.key)).toEqual(
      [
        "asset",
        "collection",
        "priceAmount",
        "value",
        "discount",
        "rank",
        "rarityClass",
        "level",
        "health",
        "shield",
        "progress",
      ],
    );

    expect(getCollectionColumns("weapons").map((column) => column.key)).toEqual([
      "asset",
      "collection",
      "priceAmount",
      "value",
      "discount",
      "level",
      "starLevel",
      "damage",
      "reloadTime",
      "ammo",
      "range",
      "progress",
    ]);
  });

  it("formats prices and percentages without losing precision", () => {
    expect(formatCellValue("priceAmount", 0.000925925925925926)).toBe(
      "0.000926 EGLD",
    );
    expect(formatCellValue("discount", -81.1767609188)).toBe("-81.18%");
    expect(formatCellValue("rank", null)).toBe("-");
  });
});
