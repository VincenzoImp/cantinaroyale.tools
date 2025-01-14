import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeDashboard } from "@/features/home/home-dashboard";
import type { HomeInsights, HomeStats } from "@/server/data/repository";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const stats: HomeStats = {
  totalNfts: 3,
  listedNfts: 2,
  characterCount: 2,
  weaponCount: 1,
  totalCollections: 2,
};

const insights: HomeInsights = {
  market: [
    {
      type: "characters",
      label: "Characters",
      total: 2,
      listed: 1,
      floorPrice: 1.5,
      averagePrice: 1.5,
      averageValue: 1.85,
    },
    {
      type: "weapons",
      label: "Weapons",
      total: 1,
      listed: 1,
      floorPrice: 0.2,
      averagePrice: 0.2,
      averageValue: 0.4,
    },
  ],
  characterMarket: [
    {
      label: "Ape Gold",
      detail: "Ape / Gold",
      total: 1,
      listed: 1,
      floorPrice: 1.5,
      averagePrice: 1.5,
      averageValue: 1.85,
    },
    {
      label: "Shark Legendary",
      detail: "Shark / Legendary",
      total: 1,
      listed: 0,
      floorPrice: null,
      averagePrice: null,
      averageValue: 2.2,
    },
  ],
  weaponMarket: [
    {
      label: "Railgun-X",
      detail: "Weapon family",
      total: 3,
      listed: 1,
      floorPrice: 0.2,
      averagePrice: 0.2,
      averageValue: 0.4,
    },
  ],
  characterRarityBySpecies: [
    {
      species: "Ape",
      total: 2,
      items: [
        { label: "Gold", count: 1 },
        { label: "Epic", count: 1 },
      ],
    },
    {
      species: "Shark",
      total: 1,
      items: [{ label: "Legendary", count: 1 }],
    },
  ],
  weaponFamilies: [{ label: "Railgun-X", count: 1 }],
  weaponStarMatrix: [
    {
      weapon: "Railgun-X",
      total: 3,
      stars: [
        { starLevel: 1, count: 1 },
        { starLevel: 2, count: 2 },
      ],
    },
  ],
  perkDistribution: [
    { label: "Nano Meds", count: 1 },
    { label: "Hodler", count: 2 },
  ],
  starDistribution: [{ label: "2 stars", count: 1 }],
};

describe("HomeDashboard", () => {
  it("renders richer aggregate sections from repository insights", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    expect(screen.getByText("Cantina Royale explorer")).toBeInTheDocument();
    expect(
      screen.queryByText("Cantina Royale market explorer"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Market overview" }),
    ).toBeInTheDocument();
    const marketOverview = screen.getByRole("region", {
      name: "Market overview",
    });
    expect(
      within(marketOverview).getAllByText("Characters").length,
    ).toBeGreaterThan(0);
    expect(within(marketOverview).getByText("Weapons")).toBeInTheDocument();
    expect(
      within(marketOverview).getByText("Character market"),
    ).toBeInTheDocument();
    expect(
      within(marketOverview).getByText("Weapon market"),
    ).toBeInTheDocument();
    expect(within(marketOverview).getByText("Ape Gold")).toBeInTheDocument();
    expect(
      within(marketOverview).getByText("Shark Legendary"),
    ).toBeInTheDocument();
    expect(within(marketOverview).getByText("Railgun-X")).toBeInTheDocument();
    expect(
      within(marketOverview).queryByText("Top collections"),
    ).not.toBeInTheDocument();
    expect(
      within(marketOverview).queryByRole("link", { name: /Characters/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Character traits" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Largest collections" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Sale rate")).toBeInTheDocument();
    expect(screen.getByText("Ape rarities")).toBeInTheDocument();
    expect(screen.getByText("Shark rarities")).toBeInTheDocument();
    expect(screen.getByText("Weapon star mix")).toBeInTheDocument();
    expect(screen.getAllByText("Railgun-X").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 star")).not.toHaveLength(0);
    expect(screen.getAllByText("2 stars")).not.toHaveLength(0);
    expect(screen.getByText("Perks")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Gameplay data" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Useful views" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Open gameplay data" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Character gameplay" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Weapon gameplay" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Upgrade economy" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Indexed locally")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Collections" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the weapon star matrix in a dedicated full-width row", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    const traitMix = screen.getByRole("region", { name: "Character traits" });
    const weaponMatrix = screen.getByRole("region", {
      name: "Weapon star ratings",
    });

    expect(
      within(traitMix).queryByText("Weapons by star rating"),
    ).not.toBeInTheDocument();
    expect(
      within(weaponMatrix).getByText("Weapon star mix"),
    ).toBeInTheDocument();
    expect(within(weaponMatrix).getByText("Railgun-X")).toBeInTheDocument();
    expect(
      within(weaponMatrix).getByRole("img", {
        name: "Railgun-X star distribution",
      }),
    ).toBeInTheDocument();
    expect(within(weaponMatrix).queryByRole("table")).not.toBeInTheDocument();
  });

  it("uses the same section chrome for the market overview as the other aggregate sections", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    const marketOverview = screen.getByRole("region", {
      name: "Market overview",
    });
    const heading = within(marketOverview).getByRole("heading", {
      name: "Market overview",
    });
    const [titleRow, contentCard] = Array.from(marketOverview.children);

    expect(titleRow).toContainElement(heading);
    expect(titleRow).toHaveClass("mb-4");
    expect(contentCard).toHaveClass("rounded-md", "border", "bg-surface");
  });

  it("keeps the primary hero action readable on dark theme backgrounds", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    expect(screen.getByRole("link", { name: "Browse characters" })).toHaveClass(
      "dark:text-canvas",
    );
  });

  it("renders character trait donut charts with counts and percentages", () => {
    const { container } = render(
      <HomeDashboard
        stats={stats}
        insights={{
          ...insights,
          perkDistribution: [
            { label: "Nano Meds", count: 100 },
            { label: "Resilience", count: 50 },
          ],
        }}
      />,
    );

    const rarities = screen.getByRole("region", { name: "Ape rarities" });
    const perks = screen.getByRole("region", { name: "Perks" });

    expect(within(rarities).getByTestId("trait-donut")).toBeInTheDocument();
    expect(within(perks).getByTestId("trait-donut")).toBeInTheDocument();
    expect(container).toContainElement(perks);
    expect(within(perks).getAllByText("Nano Meds")).not.toHaveLength(0);
    expect(within(perks).getAllByText("100")).not.toHaveLength(0);
    expect(within(perks).getAllByText("66.7%")).not.toHaveLength(0);
    expect(within(perks).getAllByText("Resilience")).not.toHaveLength(0);
    expect(within(perks).getAllByText("50")).not.toHaveLength(0);
    expect(within(perks).getAllByText("33.3%")).not.toHaveLength(0);
  });

  it("renders donut segment titles as single text nodes for React hydration", () => {
    render(
      <HomeDashboard
        stats={stats}
        insights={{
          ...insights,
          perkDistribution: [
            { label: "Nano Meds", count: 100 },
            { label: "Resilience", count: 50 },
          ],
        }}
      />,
    );

    const perks = screen.getByRole("region", { name: "Perks" });
    const donut = within(perks).getByTestId("trait-donut");
    const title = Array.from(donut.querySelectorAll("title")).find(
      (node) => node.textContent === "Nano Meds: 100 (66.7%)",
    );

    expect(title).toBeDefined();
    expect(title?.childNodes).toHaveLength(1);
    expect(title?.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it("renders every perk with segment overlay details instead of an Other slice", () => {
    render(
      <HomeDashboard
        stats={stats}
        insights={{
          ...insights,
          perkDistribution: [
            { label: "Nano Meds", count: 100 },
            { label: "Resilience", count: 50 },
            { label: "Scatter Weapons Proficiency", count: 25 },
          ],
        }}
      />,
    );

    const perks = screen.getByRole("region", { name: "Perks" });

    expect(within(perks).getAllByText("Nano Meds")).not.toHaveLength(0);
    expect(within(perks).getAllByText("Resilience")).not.toHaveLength(0);
    expect(
      within(perks).getAllByText("Scatter Weapons Proficiency"),
    ).not.toHaveLength(0);
    expect(within(perks).queryByText("Other")).not.toBeInTheDocument();
    expect(
      within(perks).getByLabelText("Nano Meds: 100 (57.1%)"),
    ).toBeInTheDocument();
    expect(
      within(within(perks).getByTestId("trait-donut")).getByTestId(
        "chart-overlay-Nano Meds",
      ),
    ).toHaveTextContent("Nano Meds10057.1%");
  });
});
