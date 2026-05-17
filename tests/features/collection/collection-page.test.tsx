import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectionPage } from "@/features/collection/collection-page";
import type { FilterOptions } from "@/server/data/repository";
import type { CollectionPage as PageData, CollectionQuery } from "@/server/data/schema";

describe("CollectionPage", () => {
  it("labels the filtered row count as results, not listed", () => {
    const filters: FilterOptions = {
      collections: ["COLLECTION-123456"],
      rarityClasses: [],
      priceCurrencies: ["EGLD"],
      names: [],
      perks: [],
      levels: [1, 2, 3],
      starLevels: [1, 2],
    };
    const query: CollectionQuery = {
      identifier: "All-Weapons",
      type: "weapons",
      page: 1,
      pageSize: 10,
      search: undefined,
      sortBy: "identifier",
      sortDirection: "asc",
      listing: "all",
      collection: undefined,
      rarityClass: undefined,
      priceCurrency: undefined,
      name: undefined,
      perk: undefined,
      level: undefined,
      starLevel: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRank: undefined,
      maxRank: undefined,
      minValue: undefined,
      maxValue: undefined,
      minProgress: undefined,
      maxProgress: undefined,
    };
    const initialPage: PageData = {
      total: 42,
      page: 1,
      pageSize: 10,
      rows: [],
    };

    render(
      <CollectionPage
        collection={{
          id: "All-Weapons",
          name: "All Weapons",
          type: "weapons",
          nftCount: 3558,
          holderCount: 167,
          description: null,
          iconUrl: null,
        }}
        initialPage={initialPage}
        filters={filters}
        query={query}
      />,
    );

    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.queryByText("Listed")).not.toBeInTheDocument();
  });
});
