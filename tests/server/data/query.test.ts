import { describe, expect, it } from "vitest";
import {
  parseCollectionSearchParamsOrDefault,
  parseCollectionSearchParams,
  parseSearchLimit,
} from "@/server/data/query";

describe("query parsing", () => {
  it("parses collection table params with defaults", () => {
    const query = parseCollectionSearchParams(
      "All-Weapons",
      "weapons",
      new URLSearchParams({
        page: "3",
        pageSize: "999",
        q: " rail ",
        sort: "priceAmount",
        direction: "desc",
        listing: "listed",
        level: "4",
        starLevel: "2",
        minPrice: "0.1",
        maxValue: "1.25",
        minProgress: "10",
      }),
    );

    expect(query).toMatchObject({
      identifier: "All-Weapons",
      type: "weapons",
      page: 3,
      pageSize: 100,
      search: "rail",
      sortBy: "priceAmount",
      sortDirection: "desc",
      listing: "listed",
      level: 4,
      starLevel: 2,
      minPrice: 0.1,
      maxValue: 1.25,
      minProgress: 10,
    });
  });

  it("clamps search limit", () => {
    expect(parseSearchLimit("200")).toBe(20);
    expect(parseSearchLimit("0")).toBe(1);
    expect(parseSearchLimit(null)).toBe(8);
  });

  it("falls back to default collection params for malformed page URLs", () => {
    const query = parseCollectionSearchParamsOrDefault(
      "All-Characters",
      "characters",
      new URLSearchParams({ sort: "broken", page: "nope" }),
    );

    expect(query).toMatchObject({
      identifier: "All-Characters",
      type: "characters",
      page: 1,
      pageSize: 25,
      sortBy: "identifier",
      sortDirection: "asc",
    });
  });
});
