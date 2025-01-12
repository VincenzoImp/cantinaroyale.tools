import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollectionToolbar } from "@/features/collection/collection-toolbar";
import type { CollectionTableState } from "@/features/collection/collection-toolbar";
import type { FilterOptions } from "@/server/data/repository";
import type { CollectionColumn } from "@/features/collection/collection-columns";

const state: CollectionTableState = {
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

const filters: FilterOptions = {
  collections: ["GSPACEAPE-08bc2b"],
  rarityClasses: ["Gold", "Epic"],
  priceCurrencies: ["EGLD"],
  names: [],
  perks: ["Nano Meds"],
  levels: [1, 15, 20],
  starLevels: [],
};

const columns: CollectionColumn[] = [
  { key: "asset", label: "Asset", sortBy: "name" },
  { key: "priceAmount", label: "Price", sortBy: "priceAmount", align: "right" },
  { key: "rank", label: "Rank", sortBy: "rank", align: "right" },
];

describe("CollectionToolbar", () => {
  it("groups table filters with visible labels and a clearer order", () => {
    const { container } = render(
      <CollectionToolbar
        state={state}
        columns={columns}
        filters={filters}
        showRarity
        loading={false}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Market")).toBeInTheDocument();
    expect(screen.getAllByText("Collection").length).toBeGreaterThan(0);
    expect(screen.getByText("Gameplay")).toBeInTheDocument();
    expect(screen.getByText("Sort")).toBeInTheDocument();
    expect(screen.getByLabelText("Search NFTs")).toBeInTheDocument();
    expect(screen.getByLabelText("Sale status")).toBeInTheDocument();
    expect(screen.getByLabelText("Collection")).toBeInTheDocument();
    expect(screen.getByLabelText("Rarity")).toBeInTheDocument();
    expect(screen.getByLabelText("Perk")).toBeInTheDocument();
    expect(screen.getByLabelText("Level")).toBeInTheDocument();
    expect(screen.getAllByText("Price").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rank").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Estimated value").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Progress").length).toBeGreaterThan(0);

    expect(
      container.querySelector("[data-collection-filter-scroll]"),
    ).toHaveClass("overflow-x-auto");
    expect(
      container.querySelector("[data-collection-filter-grid]"),
    ).toHaveClass("min-w-[1160px]");
    expect(
      container.querySelector("[data-collection-filter-group]"),
    ).toHaveClass("h-full");
    expect(
      container.querySelector("[data-collection-more-filter-scroll]"),
    ).toHaveClass("overflow-x-auto");
    expect(
      container.querySelector("[data-collection-more-filter-grid]"),
    ).toHaveClass("min-w-[720px]");
  });
});
