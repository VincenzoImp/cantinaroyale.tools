import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CharacterGameplayDashboardPage,
  EconomyGameplayDashboardPage,
  WeaponGameplayDashboardPage,
} from "@/features/game-data/gameplay-dashboard-pages";
import type {
  CharacterGameplayDashboard,
  EconomyGameplayDashboard,
  WeaponGameplayDashboard,
} from "@/server/data/repository";

const characterDashboard: CharacterGameplayDashboard = {
  perks: [
    {
      id: "Nano Meds",
      name: "Nano Meds",
      description: "Health regenerates faster when shield is full.",
      minRoll: 50,
      maxRoll: 150,
      minCoefficient: 0.05,
      maxCoefficient: 0.25,
    },
  ],
  rarityProfiles: [
    { label: "Gold", count: 1 },
    { label: "Epic", count: 1 },
  ],
  speciesProfiles: [{ label: "Genesis Space Ape", count: 2 }],
  levelProgression: [
    {
      level: 11,
      averageHealth: 5000,
      averageShield: 2500,
      talentPoints: 30,
      skillLevel: 5,
      crownEarnRate: 2.4,
    },
    {
      level: 12,
      averageHealth: 5200,
      averageShield: 2650,
      talentPoints: 33,
      skillLevel: 6,
      crownEarnRate: 2.6,
    },
  ],
  profileProgression: [
    {
      key: "ape-gold",
      label: "Ape Gold",
      species: "Genesis Space Ape",
      rarity: "Gold",
      levels: [
        {
          level: 11,
          health: 5000,
          shield: 2500,
          talentPoints: 30,
          skillLevel: 5,
          crownEarnRate: 2.4,
        },
        {
          level: 12,
          health: 5200,
          shield: 2650,
          talentPoints: 33,
          skillLevel: 6,
          crownEarnRate: 2.6,
        },
      ],
    },
    {
      key: "shark-epic",
      label: "Shark Epic",
      species: "Space Shark",
      rarity: "Epic",
      levels: [
        {
          level: 11,
          health: 5600,
          shield: 5600,
          talentPoints: 30,
          skillLevel: 5,
          crownEarnRate: 2.4,
        },
        {
          level: 12,
          health: 5900,
          shield: 5900,
          talentPoints: 33,
          skillLevel: 6,
          crownEarnRate: 2.6,
        },
      ],
    },
  ],
  statProfiles: [
    {
      key: "profile-ape-gold",
      label: "Genesis Space Ape Gold",
      species: "Genesis Space Ape",
      rarity: "Gold",
      stats: [
        { label: "Health", value: 5200 },
        { label: "Shield", value: 2650 },
        { label: "Speed", value: 510 },
        { label: "Earn rate", value: 2.6 },
        { label: "Talent", value: 33 },
        { label: "Skill", value: 6 },
      ],
    },
    {
      key: "profile-shark-epic",
      label: "Space Shark Epic",
      species: "Space Shark",
      rarity: "Epic",
      stats: [
        { label: "Health", value: 5900 },
        { label: "Shield", value: 5900 },
        { label: "Speed", value: 525 },
        { label: "Earn rate", value: 2.6 },
        { label: "Talent", value: 33 },
        { label: "Skill", value: 6 },
      ],
    },
  ],
  levelCosts: [
    {
      level: 12,
      requiredTokens: 680,
      price: [
        { itemId: "CrownDollar", amount: 7 },
        { itemId: "Shards", amount: 500 },
      ],
      rewards: [
        {
          rewardType: "item",
          rewardId: "CareerPoints",
          amountMin: 20,
          amountMax: 20,
          chance: 100,
        },
      ],
    },
  ],
};

const weaponDashboard: WeaponGameplayDashboard = {
  weaponCollections: [{ label: "Arsenal-X", count: 3 }],
  starDistribution: [{ label: "2 stars", count: 1 }],
  starBonuses: [
    {
      weapon: "RailGun",
      collectionId: "Arsenal-X",
      starLevel: 2,
      damageIncrease: 32,
      statLabel: "Range",
      statValue: 0.5,
      fusePrice: [{ itemId: "Shards", amount: 6000 }],
      fuseRewards: [
        {
          rewardType: "item",
          rewardId: "CareerPoints",
          amountMin: 10,
          amountMax: 10,
          chance: 100,
        },
      ],
      dismantleRewards: [],
    },
    {
      weapon: "AssaultGun",
      collectionId: "Arsenal-X",
      starLevel: 1,
      damageIncrease: 30,
      statLabel: null,
      statValue: null,
      fusePrice: [],
      fuseRewards: [],
      dismantleRewards: [],
    },
    {
      weapon: "AssaultGun",
      collectionId: "Arsenal-X",
      starLevel: 2,
      damageIncrease: 36,
      statLabel: "Reload Time",
      statValue: 1.1,
      fusePrice: [{ itemId: "Shards", amount: 6500 }],
      fuseRewards: [],
      dismantleRewards: [],
    },
  ],
  baseStats: [
    {
      weapon: "RailGun",
      stats: [
        { label: "Damage", value: "1100" },
        { label: "Range", value: "10" },
      ],
    },
    {
      weapon: "AssaultGun",
      stats: [
        { label: "Damage", value: "1700" },
        { label: "Reload Time", value: "2.75" },
        { label: "Ammo", value: "3" },
        { label: "Range", value: "10" },
      ],
    },
  ],
  levelCosts: [
    {
      level: 5,
      xpNeeded: 1200,
      price: [{ itemId: "Shards", amount: 500 }],
      rewards: [],
    },
  ],
};

const economyDashboard: EconomyGameplayDashboard = {
  currencyUsage: [
    { itemId: "Shards", totalAmount: 6500, uses: 2 },
    { itemId: "CrownDollar", totalAmount: 16, uses: 2 },
  ],
  upgradeCosts: [
    {
      category: "Character upgrade",
      label: "Level 12",
      requirement: "680 character tokens",
      price: [
        { itemId: "CrownDollar", amount: 7 },
        { itemId: "Shards", amount: 500 },
      ],
      rewards: [
        {
          rewardType: "item",
          rewardId: "CareerPoints",
          amountMin: 20,
          amountMax: 20,
          chance: 100,
        },
      ],
    },
    {
      category: "Character upgrade",
      label: "Level 13",
      requirement: "760 character tokens",
      price: [
        { itemId: "CrownDollar", amount: 9 },
        { itemId: "Shards", amount: 900 },
      ],
      rewards: [],
    },
    {
      category: "Weapon fuse",
      label: "RailGun star 2",
      requirement: "3 matching weapons",
      price: [{ itemId: "Shards", amount: 6000 }],
      rewards: [
        {
          rewardType: "item",
          rewardId: "CareerPoints",
          amountMin: 10,
          amountMax: 10,
          chance: 100,
        },
      ],
    },
  ],
};

describe("Gameplay dashboard pages", () => {
  it("renders interpreted character data for public browsing", () => {
    render(<CharacterGameplayDashboardPage dashboard={characterDashboard} />);

    expect(
      screen.getByRole("heading", { name: "Character Gameplay" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("NFT profiles")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "NFT rarity mix" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Species" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Character growth plot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Character profile growth plot"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Character stat diamond" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Character stat diamond plot"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Shield growth metric" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Space Shark Epic stat diamond" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Perk reference" }));
    expect(
      screen
        .getByRole("heading", { name: "Character stat diamond" })
        .compareDocumentPosition(
          screen.getByRole("heading", { name: "Character cost curve" }),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen
        .getByRole("heading", { name: "Character cost curve" })
        .compareDocumentPosition(
          screen.getByRole("heading", { name: "Perk reference" }),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByText("Health regenerates faster when shield is full."),
    ).toBeInTheDocument();
    expect(screen.getByText("Roll 50 - 150")).toBeInTheDocument();
    expect(screen.getByText("Coefficient 0.05 - 0.25")).toBeInTheDocument();
    expect(screen.getAllByText("Level 12").length).toBeGreaterThan(0);
    expect(screen.getAllByText("680 tokens").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7 Crown + 500 Shards").length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText("Perks.csv")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Ape Gold level 11 health details" }),
    );

    expect(screen.getByText("Level 11 details")).toBeInTheDocument();
    expect(screen.getAllByText("5,000").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "Perks" }),
    ).not.toBeInTheDocument();
  });

  it("renders weapon star, stat, and upgrade data without raw table digging", () => {
    render(<WeaponGameplayDashboardPage dashboard={weaponDashboard} />);

    expect(
      screen.getByRole("heading", { name: "Weapon Gameplay" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Weapon families")).not.toBeInTheDocument();
    expect(screen.queryByText("Star setups")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Weapon collections" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Star distribution" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("RailGun").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AssaultGun").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Weapon damage plot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Weapon damage by star plot"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Weapon stat diamond" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Weapon stat diamond plot"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Weapon stat comparison" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("heading", { name: "Weapon stat diamond" })
        .compareDocumentPosition(
          screen.getByRole("heading", { name: "Weapon cost curve" }),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen
        .getByRole("heading", { name: "Weapon cost curve" })
        .compareDocumentPosition(
          screen.getByRole("heading", { name: "Weapon stat comparison" }),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByText("6,000 Shards").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1,200 XP").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "RailGun star 2 damage details" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "AssaultGun star 2 damage details" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Star bonuses" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Weapon.Data.csv")).not.toBeInTheDocument();
  });

  it("renders economy only through NFT upgrade and fuse contexts", () => {
    render(<EconomyGameplayDashboardPage dashboard={economyDashboard} />);

    expect(
      screen.getByRole("heading", { name: "Upgrade economy" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Economy Gameplay" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Key metrics" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Cost contexts")).not.toBeInTheDocument();
    expect(screen.queryByText("Currencies used")).not.toBeInTheDocument();
    expect(screen.queryByText("Linked rewards")).not.toBeInTheDocument();
    expect(screen.queryByText("Fuse paths")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Currency usage by resource" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Currency usage by resource plot"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Currency sink plot" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cost curve" }),
    ).toBeInTheDocument();
    expect(screen.getByText("RailGun star 2")).toBeInTheDocument();
    expect(screen.getByText("6,000 Shards")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Character upgrade" }));
    expect(screen.getByText("Crown left axis")).toBeInTheDocument();
    expect(screen.getByText("Shards right axis")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Crown cost curve" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Crown and Shards cost curve plot"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Character upgrade Level 12 cost details",
      }),
    );
    expect(screen.getByText("20 CareerPoints")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Crown currency usage details",
      }),
    );

    expect(
      screen.getByText("16 Crown across 2 upgrade and fuse costs."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("16 total across 2 upgrade and fuse costs."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("PricePool.csv")).not.toBeInTheDocument();
  });
});
