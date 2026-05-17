import { describe, expect, it } from "vitest";
import { createCollectionSearchParams } from "@/features/collection/collection-url-state";
import type { CollectionTableState } from "@/features/collection/collection-toolbar";

const baseState: CollectionTableState = {
  page: 1,
  pageSize: 25,
  search: "",
  sortBy: "identifier",
  sortDirection: "asc",
  listing: "all",
  collection: "",
  rarityClass: "",
  priceCurrency: "",
  name: "",
  perk: "",
  level: "",
  starLevel: "",
  minPrice: "",
  maxPrice: "",
  minRank: "",
  maxRank: "",
  minValue: "",
  maxValue: "",
  minProgress: "",
  maxProgress: "",
};

describe("collection URL state", () => {
  it("omits invalid numeric range values while preserving valid filters", () => {
    const params = createCollectionSearchParams({
      ...baseState,
      search: " rail ",
      minPrice: ".",
      maxPrice: "2.5",
    });

    expect(params.get("q")).toBe("rail");
    expect(params.has("minPrice")).toBe(false);
    expect(params.get("maxPrice")).toBe("2.5");
  });

  it("serializes the expanded table filters without noisy empty values", () => {
    const params = createCollectionSearchParams({
      ...baseState,
      listing: "listed",
      perk: " Nano Meds ",
      level: "15",
      starLevel: "4",
      minRank: "1",
      maxRank: "250",
      minValue: "3.5",
      maxValue: "",
      minProgress: "60",
      maxProgress: "100",
    });

    expect(params.get("listing")).toBe("listed");
    expect(params.get("perk")).toBe("Nano Meds");
    expect(params.get("level")).toBe("15");
    expect(params.get("starLevel")).toBe("4");
    expect(params.get("minRank")).toBe("1");
    expect(params.get("maxRank")).toBe("250");
    expect(params.get("minValue")).toBe("3.5");
    expect(params.has("maxValue")).toBe(false);
    expect(params.get("minProgress")).toBe("60");
    expect(params.get("maxProgress")).toBe("100");
  });
});
