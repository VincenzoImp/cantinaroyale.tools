import { render, screen, within } from "@testing-library/react";
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
  it("places identity, artwork, ownership, and market data in the summary column", () => {
    const { rerender } = render(
      <NftDetail nft={character} gameplay={{ perks: [] }} />,
    );

    const characterIdentity = screen.getByRole("banner", {
      name: "NFT identity",
    });
    expect(characterIdentity).toHaveClass("lg:col-span-2");
    expect(
      within(characterIdentity).getByRole("heading", {
        level: 1,
        name: character.name,
      }),
    ).toBeInTheDocument();
    expect(
      within(characterIdentity).queryByRole("link", {
        name: character.identifier,
      }),
    ).not.toBeInTheDocument();

    const characterSummary = screen.getByRole("region", {
      name: "NFT summary",
    });
    expect(
      within(characterSummary).queryByRole("heading", { level: 1 }),
    ).not.toBeInTheDocument();
    expect(
      within(characterSummary).getByText("Image unavailable"),
    ).toBeInTheDocument();
    expect(
      within(characterSummary).getByRole("heading", { name: "Ownership" }),
    ).toBeInTheDocument();
    expect(
      within(characterSummary).getByRole("heading", { name: "Market details" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "NFT details" })).queryByRole(
        "heading",
        { name: "Market details" },
      ),
    ).not.toBeInTheDocument();
    expect(characterSummary).toHaveClass("lg:row-start-2");
    expect(
      within(characterSummary).queryByRole("link", { name: /Back to/ }),
    ).not.toBeInTheDocument();
    expect(
      within(characterSummary).getByRole("link", {
        name: character.identifier,
      }),
    ).toHaveAttribute(
      "href",
      `https://explorer.multiversx.com/nfts/${character.identifier}`,
    );
    expect(
      within(characterSummary).getByRole("link", {
        name: character.collection,
      }),
    ).toHaveAttribute(
      "href",
      `https://explorer.multiversx.com/collections/${character.collection}`,
    );
    expect(
      screen.queryByRole("link", { name: "Open on MultiversX Explorer" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "NFT details" })).toHaveClass(
      "lg:row-start-2",
    );

    rerender(<NftDetail nft={weapon} gameplay={{ perks: [] }} />);

    const weaponIdentity = screen.getByRole("banner", { name: "NFT identity" });
    expect(
      within(weaponIdentity).getByRole("heading", {
        level: 1,
        name: weapon.name,
      }),
    ).toBeInTheDocument();
    expect(
      within(weaponIdentity).queryByRole("link", { name: weapon.identifier }),
    ).not.toBeInTheDocument();

    const weaponSummary = screen.getByRole("region", { name: "NFT summary" });
    expect(
      within(weaponSummary).queryByRole("heading", { level: 1 }),
    ).not.toBeInTheDocument();
    expect(within(weaponSummary).getByAltText(weapon.name)).toBeInTheDocument();
    expect(
      within(weaponSummary).getByRole("link", { name: weapon.identifier }),
    ).toHaveAttribute(
      "href",
      `https://explorer.multiversx.com/nfts/${weapon.identifier}`,
    );
    expect(
      within(weaponSummary).getByRole("link", { name: weapon.collection }),
    ).toHaveAttribute(
      "href",
      `https://explorer.multiversx.com/collections/${weapon.collection}`,
    );
    expect(
      within(weaponSummary).queryByRole("link", { name: /Back to/ }),
    ).not.toBeInTheDocument();
    expect(
      within(weaponSummary).getByRole("heading", { name: "Ownership" }),
    ).toBeInTheDocument();
    expect(
      within(weaponSummary).getByRole("heading", { name: "Market details" }),
    ).toBeInTheDocument();
  });

  it("presents market, gameplay, ownership, and full trait data", () => {
    render(
      <NftDetail
        nft={character}
        gameplay={{
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
          character: {
            profile: {
              id: "NFT_Ape_Gold",
              rarity: "Gold",
              species: "Genesis Space Ape",
              raceId: "Ape",
              roleId: "Character_role_fighter",
              speed: 510,
              talentId: null,
              skillId: "FreeCharacter6_Skill",
              totalSupply: -1,
              nftTokenId: null,
            },
            currentLevel: {
              level: 15,
              health: 5315,
              shield: 2843,
              talentPoints: 45,
              skillLevel: 7,
              crownEarnRate: 3.01,
            },
            nextLevel: {
              level: 16,
              health: 5600,
              shield: 3000,
              talentPoints: 48,
              skillLevel: 8,
              crownEarnRate: 3.2,
            },
            maxLevel: {
              level: 20,
              health: 6400,
              shield: 3900,
              talentPoints: 70,
              skillLevel: 10,
              crownEarnRate: 4.4,
            },
            nextUpgrade: {
              level: 16,
              requiredTokens: 2460,
              price: [{ itemId: "CrownDollar", amount: 14 }],
              rewards: [
                {
                  rewardType: "item",
                  rewardId: "CareerPoints",
                  amountMin: 40,
                  amountMax: 40,
                  chance: 100,
                },
              ],
            },
            skillStats: [
              {
                statType: "character_skill_damage",
                label: "Skill Damage",
                currentValue: "7",
                nextValue: "8",
              },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Market details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sale price")).toBeInTheDocument();
    expect(screen.getByText("0.7 EGLD")).toBeInTheDocument();
    expect(screen.queryByText("Sale currency")).not.toBeInTheDocument();
    expect(screen.getByText("Current owner")).toBeInTheDocument();
    expect(screen.getByText("erd1owner")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Character stats" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Talent points")).toBeInTheDocument();
    expect(screen.getByText("45 / 45")).toBeInTheDocument();
    expect(screen.getByText("Earning rate")).toBeInTheDocument();
    expect(screen.getByText("Speed")).toBeInTheDocument();
    expect(screen.getByText("510")).toBeInTheDocument();
    const characterStats = screen.getByRole("region", {
      name: "Character stats",
    });
    expect(
      within(characterStats).getByTestId("nft-stat-grid"),
    ).toBeInTheDocument();
    expect(
      within(characterStats).getByTestId("nft-meter-group"),
    ).toBeInTheDocument();
    expect(within(characterStats).getByText("15 / 20")).toBeInTheDocument();
    expect(
      within(characterStats).getByText("5,315 / 6,400"),
    ).toBeInTheDocument();
    expect(
      within(characterStats).getByText("2,843 / 3,900"),
    ).toBeInTheDocument();
    expect(
      within(characterStats).queryByText(/ max$/i),
    ).not.toBeInTheDocument();
    expect(within(characterStats).getByText("Perk 1")).toBeInTheDocument();
    expect(within(characterStats).getByText("Perk 2")).toBeInTheDocument();
    expect(within(characterStats).getByText("Nano Meds")).toBeInTheDocument();
    expect(within(characterStats).getByText("Resilience")).toBeInTheDocument();
    expect(within(characterStats).queryByText("Perks")).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Appearance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Perks and stat bonuses" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Skin")).toBeInTheDocument();
    expect(screen.getAllByText("Nano Meds").length).toBeGreaterThan(0);
    expect(
      screen.queryByText("Health regenerates faster when shield is full."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Gameplay profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Roll range")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Upgrade details" })).toHaveClass(
      "bg-surface",
    );
    expect(
      screen.queryByRole("region", { name: "Gameplay data" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("FreeCharacter6_Skill")).not.toBeInTheDocument();
    expect(screen.getAllByText("Genesis Space Ape").length).toBeGreaterThan(0);
    expect(screen.queryByText("Level curve")).not.toBeInTheDocument();
    expect(screen.getByText("Next upgrade")).toBeInTheDocument();
    expect(screen.getByText("Level 15 -> 16")).toBeInTheDocument();
    expect(screen.getByText("2,460 tokens")).toBeInTheDocument();
    expect(screen.getByText("14 Crown")).toBeInTheDocument();
    expect(screen.getByText("Health +285")).toBeInTheDocument();
    expect(screen.getByText("Shield +157")).toBeInTheDocument();
    expect(screen.getByText("Talent points +3")).toBeInTheDocument();
    expect(screen.getByText("Skill +1")).toBeInTheDocument();
    expect(screen.getByText("Earn rate +0.19")).toBeInTheDocument();
    expect(screen.getByText("Skill Damage")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("normalizes fractional completion values before display", () => {
    render(
      <NftDetail
        nft={{
          ...weapon,
          progress: 0.865,
        }}
        gameplay={{ perks: [] }}
      />,
    );

    const market = screen.getByRole("region", { name: "Market details" });
    expect(within(market).getByText("86.50%")).toBeInTheDocument();
  });

  it("hides empty market fields and zero-value perk noise", () => {
    render(
      <NftDetail
        nft={{
          ...character,
          priceAmount: null,
          priceCurrency: null,
          discount: null,
          rank: null,
          progress: 0,
          attributes: {
            species: "Genesis Space Ape",
            skin: "Red",
            nanoMeds: 13,
            resilience: 0,
            grounded: 0,
          },
        }}
        gameplay={{ perks: [] }}
      />,
    );

    const market = screen.getByRole("region", { name: "Market details" });
    expect(within(market).queryByText("Sale price")).not.toBeInTheDocument();
    expect(within(market).queryByText("Sale currency")).not.toBeInTheDocument();
    expect(within(market).queryByText("Discount")).not.toBeInTheDocument();
    expect(within(market).queryByText("Rank")).not.toBeInTheDocument();
    expect(within(market).getByText("Estimated value")).toBeInTheDocument();
    expect(within(market).getByText("Progress")).toBeInTheDocument();
    expect(within(market).queryByText("Completion")).not.toBeInTheDocument();

    const bonuses = screen.getByRole("region", {
      name: "Perks and stat bonuses",
    });
    expect(within(bonuses).getByText("Nano Meds")).toBeInTheDocument();
    expect(within(bonuses).getByText("13")).toBeInTheDocument();
    expect(within(bonuses).queryByText("Resilience")).not.toBeInTheDocument();
    expect(within(bonuses).queryByText("Grounded")).not.toBeInTheDocument();
  });

  it("uses the same filled image surface for weapon and character artwork", () => {
    const { container } = render(
      <NftDetail
        nft={weapon}
        gameplay={{
          perks: [],
          weapon: {
            weaponType: "WeaponType_AssaultGun",
            collectionId: "Arsenal-X",
            currentStarBonus: {
              starLevel: 4,
              damageIncrease: 60,
              statType: "weapon_special_assaultgunx_slowmo",
              statLabel: "Slowmo",
              statValue: 1,
              fuseItemCount: 3,
            },
            allStarBonuses: [
              {
                starLevel: 3,
                damageIncrease: 50,
                statType: "weapon_extradamage_to_health",
                statLabel: "Extra damage to health",
                statValue: 1.1,
                fuseItemCount: 3,
              },
              {
                starLevel: 4,
                damageIncrease: 60,
                statType: "weapon_special_assaultgunx_slowmo",
                statLabel: "Slowmo",
                statValue: 1,
                fuseItemCount: 3,
              },
            ],
            baseStats: [
              { statType: "weapon_damage", label: "Damage", value: "1700" },
              {
                statType: "weapon_projectile_range",
                label: "Range",
                value: "10",
              },
            ],
            nextLevel: {
              level: 15,
              xpNeeded: 56200,
              price: [{ itemId: "Shards", amount: 1000 }],
              rewards: [],
            },
            fusePrice: [{ itemId: "Shards", amount: 100000 }],
            fuseRewards: [
              {
                rewardType: "item",
                rewardId: "CareerPoints",
                amountMin: 60,
                amountMax: 60,
                chance: 100,
              },
            ],
            dismantleRewards: [
              {
                rewardType: "item",
                rewardId: "Shards",
                amountMin: 5000,
                amountMax: 5000,
                chance: 100,
              },
            ],
          },
        }}
      />,
    );

    expect(
      container.querySelector("[data-transparent-asset-surface='true']"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-nft-artwork-surface='true']"),
    ).toHaveClass("bg-canvas");
    expect(screen.getByText("Star bonus")).toBeInTheDocument();
    expect(screen.getByText("+60% damage")).toBeInTheDocument();
    expect(screen.getByText("Fuse cost")).toBeInTheDocument();
    expect(screen.getByText("100,000 Shards")).toBeInTheDocument();
    expect(screen.getByText("Next weapon level")).toBeInTheDocument();

    const weaponStats = screen.getByRole("region", { name: "Weapon stats" });
    expect(
      within(weaponStats).getByTestId("nft-stat-grid"),
    ).toBeInTheDocument();
    expect(
      within(weaponStats).getByTestId("nft-meter-group"),
    ).toBeInTheDocument();
    expect(within(weaponStats).getByText("Damage")).toBeInTheDocument();
    expect(within(weaponStats).getByText("2,480")).toBeInTheDocument();
    expect(within(weaponStats).getByText("Ammo")).toBeInTheDocument();
    expect(within(weaponStats).getByText("3")).toBeInTheDocument();
    expect(within(weaponStats).getByText("Range")).toBeInTheDocument();
    expect(within(weaponStats).getByText("10.5")).toBeInTheDocument();
    expect(
      within(weaponStats).queryByTestId("metric-bar-Damage"),
    ).not.toBeInTheDocument();
    expect(
      within(weaponStats).queryByTestId("metric-bar-Ammo"),
    ).not.toBeInTheDocument();
    expect(
      within(weaponStats).queryByTestId("metric-bar-Range"),
    ).not.toBeInTheDocument();
  });
});
