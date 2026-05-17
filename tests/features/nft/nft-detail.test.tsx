import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NftDetail } from "@/features/nft/nft-detail";
import type { Nft } from "@/server/data/schema";

const character: Nft = {
  identifier: "GSPACEAPE-08bc2b-1134",
  collection: "GSPACEAPE-08bc2b",
  type: "characters",
  name: "GenesisSpaceApe #3199",
  url: null,
  thumbnailUrl: null,
  owner: "erd1owner",
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
  talentPointsAvailable: 45,
  talentPointsTotal: 45,
  earnRate: 3.01,
  attributes: {
    species: "Genesis Space Ape",
    skin: "Red",
    nanoMeds: 13,
    resilience: 12,
  },
};

const weapon: Nft = {
  identifier: "CRWEAPONS-e5ab49-14ac",
  collection: "CRWEAPONS-e5ab49",
  type: "weapons",
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
  xp: 121200,
  wear: 39.6,
  level: 14,
  starLevel: 4,
  damage: 2480,
  reloadTime: 2.75,
  ammo: 3,
  range: 10.5,
  attributes: {},
};

describe("NftDetail", () => {
  it("presents market, gameplay, ownership, and full trait data", () => {
    render(<NftDetail nft={character} />);

    expect(screen.getByRole("heading", { name: "Market details" })).toBeInTheDocument();
    expect(screen.getByText("Sale price")).toBeInTheDocument();
    expect(screen.getByText("0.7 EGLD")).toBeInTheDocument();
    expect(screen.getByText("Current owner")).toBeInTheDocument();
    expect(screen.getByText("erd1owner")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Character stats" })).toBeInTheDocument();
    expect(screen.getByText("Talent points")).toBeInTheDocument();
    expect(screen.getByText("45 / 45")).toBeInTheDocument();
    expect(screen.getByText("Earning rate")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Perks and stat bonuses" })).toBeInTheDocument();
    expect(screen.getByText("Skin")).toBeInTheDocument();
    expect(screen.getByText("Nano Meds")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("uses a neutral transparency surface behind weapon PNG artwork", () => {
    const { container } = render(<NftDetail nft={weapon} />);

    expect(
      container.querySelector("[data-transparent-asset-surface='true']"),
    ).toHaveClass("asset-transparent-surface");
  });
});
