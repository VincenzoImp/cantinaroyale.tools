import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeDashboard } from "@/features/home/home-dashboard";
import type {
  HomeInsights,
  HomeStats,
} from "@/server/data/repository";

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
  topCollections: [
    {
      id: "CHAR-123456",
      name: "Characters",
      type: "characters",
      nftCount: 2,
      listedCount: 1,
      floorPrice: 1.5,
      averageValue: 1.85,
    },
  ],
  rarityDistribution: [
    { label: "Gold", count: 1 },
    { label: "Epic", count: 1 },
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
  topPerks: [{ label: "Nano Meds", count: 1 }],
  starDistribution: [{ label: "2 stars", count: 1 }],
};

describe("HomeDashboard", () => {
  it("renders richer aggregate sections from repository insights", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    expect(screen.getByText("Cantina Royale explorer")).toBeInTheDocument();
    expect(
      screen.queryByText("Cantina Royale market explorer"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Market overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Character traits" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Largest collections" })).toBeInTheDocument();
    expect(screen.getByText("Sale rate")).toBeInTheDocument();
    expect(screen.getByText("Rarities")).toBeInTheDocument();
    expect(screen.getByText("Weapons by star rating")).toBeInTheDocument();
    expect(screen.getByText("Railgun-X")).toBeInTheDocument();
    expect(screen.getByText("1 star")).toBeInTheDocument();
    expect(screen.getByText("2 stars")).toBeInTheDocument();
    expect(screen.getByText("Top perks")).toBeInTheDocument();
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
      within(weaponMatrix).getByText("Weapons by star rating"),
    ).toBeInTheDocument();
    expect(within(weaponMatrix).getByText("Railgun-X")).toBeInTheDocument();
  });

  it("keeps the primary hero action readable on dark theme backgrounds", () => {
    render(<HomeDashboard stats={stats} insights={insights} />);

    expect(screen.getByRole("link", { name: "Browse characters" })).toHaveClass(
      "dark:text-canvas",
    );
  });
});
