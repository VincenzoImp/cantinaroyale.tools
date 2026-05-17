import { describe, expect, it } from "vitest";
import {
  collectionRowSchema,
  collectionQuerySchema,
  collectionSummarySchema,
  nftSchema,
  searchResultSchema,
} from "@/server/data/schema";

describe("data schemas", () => {
  it("accepts a normalized character NFT", () => {
    const parsed = nftSchema.parse({
      type: "characters",
      identifier: "GSPACEAPE-08bc2b-1134",
      collection: "GSPACEAPE-08bc2b",
      name: "GenesisSpaceApe #3199",
      url: "https://media.elrond.com/nfts/asset/example.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/example",
      owner: "erd1qqqqqqqqqqqqqpgq",
      rank: 1534,
      priceCurrency: "EGLD",
      priceAmount: 0.7,
      value: 3.7188073582,
      discount: -81.1767609188,
      progress: 42.4842928282,
      rarityClass: "Gold",
      perk1: "Nano Meds",
      perk2: "Resilience",
      level: 15,
      characterTokens: 6514,
      health: 5315,
      shield: 2843,
      attributes: {
        species: "Genesis Space Ape",
        skin: "Red",
      },
    });

    expect(parsed.type).toBe("characters");
    expect(parsed.attributes.species).toBe("Genesis Space Ape");
  });

  it("accepts a normalized weapon NFT", () => {
    const parsed = nftSchema.parse({
      type: "weapons",
      identifier: "CRWEAPONS-e5ab49-14ac",
      collection: "CRWEAPONS-e5ab49",
      name: "Blaster-X",
      url: "https://media.elrond.com/nfts/asset/example.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/example",
      owner: null,
      rank: null,
      priceCurrency: "EGLD",
      priceAmount: 0.6,
      value: 4.890997956,
      discount: -87.7325648998,
      progress: 86.5841137103,
      xp: 121200,
      wear: 39.6,
      level: 14,
      starLevel: 4,
      damage: 2480,
      reloadTime: 2.75,
      ammo: 3,
      range: 10.5,
      attributes: {},
    });

    if (parsed.type !== "weapons") {
      throw new Error("Expected a weapon NFT");
    }
    expect(parsed.damage).toBe(2480);
  });

  it("rejects unsupported collection types", () => {
    expect(() =>
      collectionSummarySchema.parse({
        id: "BROKEN",
        name: "Broken",
        type: "items",
        nftCount: 0,
        holderCount: null,
        description: null,
        iconUrl: null,
      }),
    ).toThrow();
  });

  it("coerces collection query defaults and bounds", () => {
    const parsed = collectionQuerySchema.parse({
      identifier: "All-Characters",
      type: "characters",
      page: "2",
      pageSize: "500",
      search: "  ape  ",
      sortBy: "priceAmount",
      sortDirection: "desc",
    });

    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(100);
    expect(parsed.search).toBe("ape");
  });

  it("keeps search responses compact", () => {
    const result = searchResultSchema.parse({
      identifier: "CRMYTH-546419-010a",
      collection: "CRMYTH-546419",
      type: "weapons",
      name: "Dragonbreath",
      url: "https://media.elrond.com/nfts/asset/example.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/example",
    });

    expect(Object.keys(result).sort()).toEqual([
      "collection",
      "identifier",
      "name",
      "thumbnailUrl",
      "type",
      "url",
    ]);
  });

  it("keeps original asset URLs on collection rows for transparent weapon art", () => {
    const result = collectionRowSchema.parse({
      type: "weapons",
      identifier: "CRWEAPONS-e5ab49-14ac",
      collection: "CRWEAPONS-e5ab49",
      name: "Blaster-X",
      url: "https://media.elrond.com/nfts/asset/blaster.png",
      thumbnailUrl: "https://media.elrond.com/nfts/thumbnail/blaster",
      owner: null,
      rank: null,
      priceCurrency: "EGLD",
      priceAmount: 0.6,
      value: 4.89,
      discount: -87.7,
      progress: 86.5,
      rarityClass: null,
      perk1: null,
      perk2: null,
      level: 14,
      characterTokens: null,
      health: null,
      shield: null,
      xp: 121200,
      wear: 39.6,
      starLevel: 4,
      damage: 2480,
      reloadTime: 2.75,
      ammo: 3,
      range: 10.5,
    });

    expect(result.url).toBe("https://media.elrond.com/nfts/asset/blaster.png");
  });
});
