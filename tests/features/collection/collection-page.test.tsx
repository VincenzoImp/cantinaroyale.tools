import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectionPage } from "@/features/collection/collection-page";
import type { FilterOptions } from "@/server/data/repository";
import type {
  CollectionPage as PageData,
  CollectionQuery,
} from "@/server/data/schema";

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
      rows: [
        {
          type: "weapons",
          identifier: "WEAPON-123456-0001",
          collection: "COLLECTION-123456",
          name: "Railgun-X",
          url: null,
          thumbnailUrl: null,
          owner: "erd1owner",
          rank: null,
          priceCurrency: "EGLD",
          priceAmount: 0.2,
          value: 0.4,
          discount: -50,
          progress: 75,
          rarityClass: null,
          perk1: null,
          perk2: null,
          level: 5,
          characterTokens: null,
          health: null,
          shield: null,
          xp: 1200,
          wear: 10,
          starLevel: 2,
          damage: 1100,
          reloadTime: 2.75,
          ammo: 3,
          range: 10,
        },
      ],
    };
    const { container } = render(
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

    expect(
      screen.queryByRole("heading", { name: "Weapon gameplay" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Weapon star setups")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Weapon.Data" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /game_data_weapon_data/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.queryByText("Listed")).not.toBeInTheDocument();

    const clearFilters = screen.getByRole("button", { name: "Clear filters" });
    expect(
      container.querySelector("[data-collection-results-actions]"),
    ).toContainElement(clearFilters);
    expect(
      container.querySelector("[data-collection-filter-grid]"),
    ).not.toContainElement(clearFilters);
    expect(
      container.querySelector("[data-collection-mobile-results]"),
    ).toHaveClass("md:hidden");
    expect(screen.getByLabelText("NFTs per page")).toHaveClass(
      "appearance-none",
      "pr-10",
    );
    expect(
      container.querySelector("[data-page-size-dropdown-icon]"),
    ).toHaveClass("right-3");
    expect(
      screen
        .getAllByRole("link", { name: /Railgun-X/ })
        .every(
          (link) => link.getAttribute("href") === "/nft/WEAPON-123456-0001",
        ),
    ).toBe(true);
  });
});
