import Image from "next/image";
import type { ReactNode } from "react";
import type { NftGameplay } from "@/server/data/repository";
import type { Nft } from "@/server/data/schema";
import { formatCellValue } from "@/features/collection/collection-columns";

type Stat = {
  label: string;
  value: string;
};

type TraitEntry = [string, string | number | boolean | null];
type InlineStatItem = {
  label: string;
  value: string | number | null | undefined;
};

const VISUAL_TRAIT_KEYS = new Set([
  "species",
  "head",
  "face",
  "skin",
  "eyes",
  "mouth",
  "earrings",
  "headgear",
  "body",
  "legs",
  "legAccessories",
  "background",
]);

function traits(nft: Nft) {
  return Object.entries(nft.attributes)
    .filter(([, value]) => value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right));
}

function groupedTraits(nft: Nft) {
  const groups = {
    visual: [] as TraitEntry[],
    perks: [] as TraitEntry[],
    other: [] as TraitEntry[],
  };

  for (const trait of traits(nft)) {
    const [key, value] = trait;
    if (typeof value === "number" && value === 0) {
      continue;
    }

    if (VISUAL_TRAIT_KEYS.has(key)) {
      groups.visual.push(trait);
    } else if (typeof value === "number") {
      groups.perks.push(trait);
    } else {
      groups.other.push(trait);
    }
  }

  return groups;
}

function formatNumberish(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function formatItemId(itemId: string) {
  return itemId === "CrownDollar" ? "Crown" : itemId;
}

function normalizePercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return value > 0 && value <= 1 ? value * 100 : value;
}

function nftExplorerUrl(identifier: string) {
  return `https://explorer.multiversx.com/nfts/${identifier}`;
}

function collectionExplorerUrl(collection: string) {
  return `https://explorer.multiversx.com/collections/${collection}`;
}

function resolveMetricMax(
  value: number | null | undefined,
  max: number | null | undefined,
) {
  return Math.max(value ?? 0, max ?? 0, 1);
}

function formatMetricRatio(
  value: number | null | undefined,
  max: number | null | undefined,
) {
  if (max === null || max === undefined || max <= 0) {
    return formatNumberish(value);
  }

  return `${formatNumberish(value)} / ${formatNumberish(
    resolveMetricMax(value, max),
  )}`;
}

function marketValue(nft: Nft) {
  if (nft.value === null || nft.value === undefined) {
    return "-";
  }

  return `${formatNumberish(nft.value)} ${nft.priceCurrency ?? "EGLD"}`;
}

function formatTraitLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTraitValue(value: TraitEntry[1]) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function statValue(stat: Stat) {
  return (
    <div
      key={`${stat.label}-${stat.value}`}
      className="min-w-0 rounded border border-line bg-canvas p-3"
    >
      <div className="text-xs uppercase tracking-wide text-muted">
        {stat.label}
      </div>
      <div className="mt-1 break-words text-base font-semibold text-ink">
        {stat.value}
      </div>
    </div>
  );
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div
      data-testid="nft-stat-grid"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map(statValue)}
    </div>
  );
}

function MeterGroup({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="nft-meter-group"
      className="grid gap-4 rounded border border-line bg-canvas p-3"
    >
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="min-w-0 rounded-md border border-line bg-surface p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricBar({
  label,
  value,
  max,
  display,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
  display?: string;
}) {
  const percent =
    value === null || value === undefined
      ? 0
      : Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div data-testid={`metric-bar-${label}`} className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular-nums text-muted">
          {display ?? formatNumberish(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-soft">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function MarketPanel({ nft }: { nft: Nft }) {
  const completion = normalizePercent(nft.progress);
  const stats = [
    nft.priceAmount !== null && nft.priceAmount !== undefined
      ? {
          label: "Sale price",
          value: formatCellValue("priceAmount", nft.priceAmount),
        }
      : null,
    { label: "Estimated value", value: marketValue(nft) },
    nft.discount !== null && nft.discount !== undefined
      ? {
          label: "Discount",
          value: formatCellValue("discount", nft.discount),
        }
      : null,
    nft.rank !== null && nft.rank !== undefined
      ? { label: "Rank", value: formatCellValue("rank", nft.rank) }
      : null,
  ].filter((item): item is Stat => item !== null);

  return (
    <Panel title="Market details">
      <div className="grid gap-4 sm:grid-cols-2">{stats.map(statValue)}</div>
      {completion !== null ? (
        <div className="mt-4 grid gap-3">
          <MetricBar
            label="Progress"
            value={completion}
            max={100}
            display={formatCellValue("progress", completion)}
          />
        </div>
      ) : null}
    </Panel>
  );
}

function OwnerPanel({ nft }: { nft: Nft }) {
  return (
    <Panel title="Ownership">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">
          Current owner
        </div>
        <div className="mt-1 break-all text-sm font-medium text-ink">
          {nft.owner ?? "-"}
        </div>
      </div>
    </Panel>
  );
}

function CharacterProfile({
  nft,
  characterGameplay,
}: {
  nft: Extract<Nft, { type: "characters" }>;
  characterGameplay?: NftGameplay["character"] | null;
}) {
  const maxLevel = characterGameplay?.maxLevel ?? null;
  const talentPoints =
    nft.talentPointsAvailable !== undefined &&
    nft.talentPointsTotal !== undefined
      ? `${formatNumberish(nft.talentPointsAvailable)} / ${formatNumberish(
          nft.talentPointsTotal,
        )}`
      : "-";
  const stats = [
    characterGameplay?.profile?.species
      ? {
          label: "Species",
          value: characterGameplay.profile.species,
        }
      : null,
    {
      label: "Rarity",
      value: formatCellValue("rarityClass", nft.rarityClass),
    },
    { label: "Level", value: formatCellValue("level", nft.level) },
    characterGameplay?.profile?.speed !== null &&
    characterGameplay?.profile?.speed !== undefined
      ? {
          label: "Speed",
          value: formatNumberish(characterGameplay.profile.speed),
        }
      : null,
    {
      label: "Character tokens",
      value: formatCellValue("characterTokens", nft.characterTokens),
    },
    { label: "Talent points", value: talentPoints },
    { label: "Earning rate", value: formatNumberish(nft.earnRate) },
    {
      label: "Perk 1",
      value: nft.perk1?.trim() ? nft.perk1 : "-",
    },
    {
      label: "Perk 2",
      value: nft.perk2?.trim() ? nft.perk2 : "-",
    },
  ].filter((item): item is Stat => item !== null);

  return (
    <Panel title="Character stats">
      <div className="grid gap-4">
        <StatGrid stats={stats} />
        <MeterGroup>
          <MetricBar
            label="Level"
            value={nft.level}
            max={resolveMetricMax(nft.level, maxLevel?.level)}
            display={formatMetricRatio(nft.level, maxLevel?.level)}
          />
          <MetricBar
            label="Health"
            value={nft.health}
            max={resolveMetricMax(nft.health, maxLevel?.health)}
            display={formatMetricRatio(nft.health, maxLevel?.health)}
          />
          <MetricBar
            label="Shield"
            value={nft.shield}
            max={resolveMetricMax(nft.shield, maxLevel?.shield)}
            display={formatMetricRatio(nft.shield, maxLevel?.shield)}
          />
        </MeterGroup>
      </div>
    </Panel>
  );
}

function WeaponProfile({ nft }: { nft: Extract<Nft, { type: "weapons" }> }) {
  const stats = [
    { label: "Level", value: formatCellValue("level", nft.level) },
    {
      label: "Stars",
      value: formatCellValue("starLevel", nft.starLevel),
    },
    { label: "XP", value: formatCellValue("xp", nft.xp) },
    { label: "Wear", value: formatCellValue("wear", nft.wear) },
    { label: "Damage", value: formatCellValue("damage", nft.damage) },
    { label: "Ammo", value: formatCellValue("ammo", nft.ammo) },
    {
      label: "Reload time",
      value: formatCellValue("reloadTime", nft.reloadTime),
    },
    { label: "Range", value: formatCellValue("range", nft.range) },
  ];

  return (
    <Panel title="Weapon stats">
      <div className="grid gap-4">
        <StatGrid stats={stats} />
        <MeterGroup>
          <MetricBar label="Level" value={nft.level} max={20} />
          <MetricBar
            label="Wear"
            value={nft.wear}
            max={100}
            display={formatCellValue("wear", nft.wear)}
          />
        </MeterGroup>
      </div>
    </Panel>
  );
}

function formatAmount(amount: { itemId: string; amount: number }) {
  return `${formatNumberish(amount.amount)} ${formatItemId(amount.itemId)}`;
}

function formatReward(reward: {
  rewardId: string | null;
  rewardType: string;
  amountMin: number | null;
  amountMax: number | null;
  chance: number | null;
}) {
  const rewardName = reward.rewardId ?? reward.rewardType;
  const amount =
    reward.amountMin === null && reward.amountMax === null
      ? ""
      : reward.amountMin === reward.amountMax
        ? `${formatNumberish(reward.amountMin)} `
        : `${formatNumberish(reward.amountMin)}-${formatNumberish(
            reward.amountMax,
          )} `;
  const chance =
    reward.chance === null ? "" : ` (${formatNumberish(reward.chance)}%)`;

  return `${amount}${rewardName}${chance}`;
}

function InlineStats({ items }: { items: InlineStatItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded border border-line bg-canvas p-3"
        >
          <div className="text-xs uppercase tracking-wide text-muted">
            {item.label}
          </div>
          <div className="mt-1 font-semibold text-ink">
            {item.value === null ||
            item.value === undefined ||
            item.value === ""
              ? "-"
              : typeof item.value === "number"
                ? formatNumberish(item.value)
                : item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function CharacterGameplay({
  character,
}: {
  character: NonNullable<NftGameplay["character"]>;
}) {
  const upgradeDeltas =
    character.currentLevel && character.nextLevel
      ? [
          {
            label: "Health",
            value: character.nextLevel.health - character.currentLevel.health,
          },
          {
            label: "Shield",
            value: character.nextLevel.shield - character.currentLevel.shield,
          },
          {
            label: "Talent points",
            value:
              character.nextLevel.talentPoints -
              character.currentLevel.talentPoints,
          },
          {
            label: "Skill",
            value:
              character.nextLevel.skillLevel -
              character.currentLevel.skillLevel,
          },
          {
            label: "Earn rate",
            value:
              character.nextLevel.crownEarnRate -
              character.currentLevel.crownEarnRate,
          },
        ].filter((item) => item.value !== 0)
      : [];
  const upgradeCostItems: InlineStatItem[] = [];

  if (character.nextUpgrade && character.nextUpgrade.requiredTokens !== null) {
    upgradeCostItems.push({
      label: "Character tokens",
      value: `${formatNumberish(character.nextUpgrade.requiredTokens)} tokens`,
    });
  }

  if (character.nextUpgrade && character.nextUpgrade.price.length > 0) {
    upgradeCostItems.push({
      label: "Cost",
      value: character.nextUpgrade.price.map(formatAmount).join(" + "),
    });
  }

  return (
    <div className="grid gap-4">
      {character.nextUpgrade ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">Next upgrade</h3>
          <div className="mt-3 rounded border border-line bg-canvas p-3">
            <div className="grid gap-3 text-sm text-muted">
              <span className="font-medium text-ink">
                {character.currentLevel
                  ? `Level ${character.currentLevel.level} -> ${character.nextUpgrade.level}`
                  : `Level ${character.nextUpgrade.level}`}
              </span>
              <InlineStats items={upgradeCostItems} />
              {upgradeDeltas.length > 0 ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">
                    Gained stats
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {upgradeDeltas.map((item) => (
                      <span
                        key={item.label}
                        className="rounded bg-soft px-2 py-1 text-xs font-medium text-ink"
                      >
                        {item.label} {item.value > 0 ? "+" : ""}
                        {formatNumberish(item.value)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {character.nextUpgrade.rewards.length > 0 ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">
                    Reward
                  </div>
                  <div className="mt-1 font-medium text-ink">
                    {character.nextUpgrade.rewards
                      .map(formatReward)
                      .join(" + ")}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {character.skillStats.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">Skill stats</h3>
          <div className="mt-3 grid gap-2">
            {character.skillStats.map((stat) => (
              <div
                key={stat.statType}
                className="grid gap-2 rounded border border-line bg-canvas p-3 sm:grid-cols-[1fr_auto]"
              >
                <span className="font-medium text-ink">{stat.label}</span>
                <span className="text-sm tabular-nums text-muted">
                  {stat.currentValue ?? "-"} {"->"} {stat.nextValue ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WeaponGameplay({
  weapon,
}: {
  weapon: NonNullable<NftGameplay["weapon"]>;
}) {
  return (
    <div className="grid gap-4">
      {weapon.currentStarBonus ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">Star bonus</h3>
          <div className="mt-3 rounded border border-line bg-canvas p-3">
            <div className="grid gap-2 text-sm text-muted">
              <span className="font-semibold text-ink">
                +{formatNumberish(weapon.currentStarBonus.damageIncrease)}%
                damage
              </span>
              {weapon.currentStarBonus.statLabel ? (
                <span>
                  {weapon.currentStarBonus.statLabel}:{" "}
                  {formatNumberish(weapon.currentStarBonus.statValue)}
                </span>
              ) : null}
              {weapon.currentStarBonus.fuseItemCount ? (
                <span>
                  Fuse items:{" "}
                  {formatNumberish(weapon.currentStarBonus.fuseItemCount)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {weapon.nextLevel ? (
          <div className="rounded border border-line bg-canvas p-3">
            <h3 className="text-sm font-semibold text-ink">
              Next weapon level
            </h3>
            <div className="mt-2 grid gap-1 text-sm text-muted">
              <span>Level {weapon.nextLevel.level}</span>
              {weapon.nextLevel.xpNeeded !== null ? (
                <span>XP {formatNumberish(weapon.nextLevel.xpNeeded)}</span>
              ) : null}
              {weapon.nextLevel.price.length > 0 ? (
                <span>
                  {weapon.nextLevel.price.map(formatAmount).join(" + ")}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {weapon.fusePrice.length > 0 ? (
          <div className="rounded border border-line bg-canvas p-3">
            <h3 className="text-sm font-semibold text-ink">Fuse cost</h3>
            <div className="mt-2 text-sm text-muted">
              {weapon.fusePrice.map(formatAmount).join(" + ")}
            </div>
          </div>
        ) : null}
      </div>

      {weapon.fuseRewards.length > 0 || weapon.dismantleRewards.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {weapon.fuseRewards.length > 0 ? (
            <div className="rounded border border-line bg-canvas p-3">
              <h3 className="text-sm font-semibold text-ink">Fuse reward</h3>
              <div className="mt-2 text-sm text-muted">
                {weapon.fuseRewards.map(formatReward).join(" + ")}
              </div>
            </div>
          ) : null}
          {weapon.dismantleRewards.length > 0 ? (
            <div className="rounded border border-line bg-canvas p-3">
              <h3 className="text-sm font-semibold text-ink">
                Dismantle reward
              </h3>
              <div className="mt-2 text-sm text-muted">
                {weapon.dismantleRewards.map(formatReward).join(" + ")}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function UpgradePanel({ gameplay }: { gameplay?: NftGameplay | null }) {
  if (!gameplay || (!gameplay.character && !gameplay.weapon)) {
    return null;
  }

  return (
    <section
      aria-label="Upgrade details"
      className="rounded-md border border-line bg-surface p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-ink">Upgrade details</h2>
      <div className="mt-4 grid gap-4">
        {gameplay.character ? (
          <CharacterGameplay character={gameplay.character} />
        ) : null}

        {gameplay.weapon ? <WeaponGameplay weapon={gameplay.weapon} /> : null}
      </div>
    </section>
  );
}

function TraitGrid({ traits: entries }: { traits: TraitEntry[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex min-w-0 items-center justify-between gap-3 rounded border border-line bg-canvas px-3 py-2"
        >
          <span className="truncate text-sm text-muted">
            {formatTraitLabel(key)}
          </span>
          <span className="truncate text-sm font-medium text-ink">
            {formatTraitValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TraitSection({
  title,
  entries,
}: {
  title: string;
  entries: TraitEntry[];
}) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className="min-w-0 rounded-md border border-line bg-surface p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">
        <TraitGrid traits={entries} />
      </div>
    </section>
  );
}

export function NftDetail({
  nft,
  gameplay,
}: {
  nft: Nft;
  gameplay?: NftGameplay | null;
}) {
  const traitGroups = groupedTraits(nft);

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(320px,0.82fr)_1fr] lg:items-start lg:px-8">
      <header
        aria-label="NFT identity"
        className="min-w-0 lg:col-span-2 lg:row-start-1"
      >
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          {nft.type === "characters" ? "Character" : "Weapon"}
        </p>
        <h1 className="mt-2 break-words text-3xl font-semibold text-ink sm:text-4xl">
          {nft.name}
        </h1>
      </header>

      <section
        aria-label="NFT summary"
        className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2"
      >
        <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
          <div
            data-nft-artwork-surface="true"
            className="relative aspect-square bg-canvas"
          >
            {(nft.url ?? nft.thumbnailUrl) ? (
              <Image
                src={nft.url ?? nft.thumbnailUrl ?? ""}
                alt={nft.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                Image unavailable
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line p-4">
            <a
              href={nftExplorerUrl(nft.identifier)}
              target="_blank"
              rel="noreferrer"
              className="max-w-full rounded bg-soft px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted transition hover:text-primary"
              title="Open NFT on MultiversX Explorer"
            >
              <span className="block truncate">{nft.identifier}</span>
            </a>
            <a
              href={collectionExplorerUrl(nft.collection)}
              target="_blank"
              rel="noreferrer"
              className="max-w-full rounded bg-soft px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted transition hover:text-primary"
              title="Open collection on MultiversX Explorer"
            >
              <span className="block truncate">{nft.collection}</span>
            </a>
          </div>
        </div>
        <OwnerPanel nft={nft} />
        <MarketPanel nft={nft} />
      </section>

      <section
        aria-label="NFT details"
        className="min-w-0 space-y-5 lg:col-start-2 lg:row-start-2"
      >
        {nft.type === "characters" ? (
          <CharacterProfile
            nft={nft}
            characterGameplay={gameplay?.character ?? null}
          />
        ) : (
          <WeaponProfile nft={nft} />
        )}

        <UpgradePanel gameplay={gameplay} />

        <TraitSection title="Appearance" entries={traitGroups.visual} />
        <TraitSection
          title="Perks and stat bonuses"
          entries={traitGroups.perks}
        />
        <TraitSection title="Additional traits" entries={traitGroups.other} />
      </section>
    </main>
  );
}
