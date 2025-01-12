import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Nft } from "@/server/data/schema";
import { formatCellValue } from "@/features/collection/collection-columns";

type Stat = {
  label: string;
  value: string;
};

type TraitEntry = [string, string | number | boolean | null];

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

const PERK_TRAIT_KEYS = new Set([
  "overachiever",
  "hodler",
  "grounded",
  "stonewall",
  "adrenalineRush",
  "overshield",
  "blackWidow",
  "galvanized",
  "nanoMeds",
  "resilience",
  "coldBlooded",
  "perseverance",
  "escapeArtist",
  "scavenger",
  "coolMoves",
  "brawler",
  "automaticWeaponsProficiency",
  "scatterWeaponsProficiency",
  "precisionWeaponsProficiency",
  "explosiveWeaponsProficiency",
  "elementalWeaponsProficiency",
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
    if (VISUAL_TRAIT_KEYS.has(key)) {
      groups.visual.push(trait);
    } else if (PERK_TRAIT_KEYS.has(key) || typeof value === "number") {
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

  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
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
    <div key={`${stat.label}-${stat.value}`} className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-muted">
        {stat.label}
      </div>
      <div className="mt-1 break-words text-base font-semibold text-ink">
        {stat.value}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-line bg-surface p-4 shadow-sm">
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
    <div className="grid gap-2">
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
  return (
    <Panel title="Market details">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            label: "Sale price",
            value: formatCellValue("priceAmount", nft.priceAmount),
          },
          { label: "Estimated value", value: marketValue(nft) },
          {
            label: "Discount",
            value: formatCellValue("discount", nft.discount),
          },
          {
            label: "Completion",
            value: formatCellValue("progress", nft.progress),
          },
          { label: "Sale currency", value: nft.priceCurrency ?? "-" },
          { label: "Rank", value: formatCellValue("rank", nft.rank) },
        ].map(statValue)}
      </div>
      <div className="mt-4 grid gap-3">
        <MetricBar
          label="Completion"
          value={nft.progress}
          max={100}
          display={formatCellValue("progress", nft.progress)}
        />
      </div>
    </Panel>
  );
}

function OwnerPanel({ nft }: { nft: Nft }) {
  return (
    <Panel title="Ownership">
      <div className="grid gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Current owner
          </div>
          <div className="mt-1 break-all text-sm font-medium text-ink">
            {nft.owner ?? "-"}
          </div>
        </div>
        <Link
          href={`https://explorer.multiversx.com/nfts/${nft.identifier}`}
          className="inline-flex w-fit rounded-md border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink transition hover:border-strong hover:bg-soft"
        >
          Open on MultiversX Explorer
        </Link>
      </div>
    </Panel>
  );
}

function CharacterProfile({ nft }: { nft: Extract<Nft, { type: "characters" }> }) {
  const talentPoints =
    nft.talentPointsAvailable !== undefined && nft.talentPointsTotal !== undefined
      ? `${formatNumberish(nft.talentPointsAvailable)} / ${formatNumberish(
          nft.talentPointsTotal,
        )}`
      : "-";

  return (
    <Panel title="Character stats">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Rarity",
              value: formatCellValue("rarityClass", nft.rarityClass),
            },
            { label: "Level", value: formatCellValue("level", nft.level) },
            {
              label: "Character tokens",
              value: formatCellValue("characterTokens", nft.characterTokens),
            },
            { label: "Talent points", value: talentPoints },
            { label: "Earning rate", value: formatNumberish(nft.earnRate) },
            {
              label: "Perks",
              value:
                [nft.perk1, nft.perk2].filter(Boolean).join(" / ") || "-",
            },
          ].map(statValue)}
        </div>
        <div className="grid gap-4">
          <MetricBar label="Level" value={nft.level} max={20} />
          <MetricBar label="Health" value={nft.health} max={7336} />
          <MetricBar label="Shield" value={nft.shield} max={4266} />
        </div>
      </div>
    </Panel>
  );
}

function WeaponProfile({ nft }: { nft: Extract<Nft, { type: "weapons" }> }) {
  return (
    <Panel title="Weapon stats">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Level", value: formatCellValue("level", nft.level) },
            { label: "Stars", value: formatCellValue("starLevel", nft.starLevel) },
            { label: "XP", value: formatCellValue("xp", nft.xp) },
            { label: "Wear", value: formatCellValue("wear", nft.wear) },
            {
              label: "Reload time",
              value: formatCellValue("reloadTime", nft.reloadTime),
            },
            { label: "Range", value: formatCellValue("range", nft.range) },
          ].map(statValue)}
        </div>
        <div className="grid gap-4">
          <MetricBar label="Level" value={nft.level} max={20} />
          <MetricBar label="Damage" value={nft.damage} max={4504} />
          <MetricBar label="Ammo" value={nft.ammo} max={80} />
          <MetricBar label="Range" value={nft.range} max={11} />
          <MetricBar
            label="Wear"
            value={nft.wear}
            max={100}
            display={formatCellValue("wear", nft.wear)}
          />
        </div>
      </div>
    </Panel>
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
    <section className="rounded-md border border-line bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">
        <TraitGrid traits={entries} />
      </div>
    </section>
  );
}

export function NftDetail({ nft }: { nft: Nft }) {
  const traitGroups = groupedTraits(nft);
  const isTransparentAsset = nft.type === "weapons";

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(320px,0.82fr)_1fr] lg:px-8">
      <section className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
          <div
            data-transparent-asset-surface={
              isTransparentAsset ? "true" : undefined
            }
            className={`relative aspect-square ${
              isTransparentAsset ? "asset-transparent-surface" : "bg-canvas"
            }`}
          >
            {nft.url ?? nft.thumbnailUrl ? (
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
            <Link
              href={`/collection/${
                nft.type === "characters" ? "All-Characters" : "All-Weapons"
              }`}
              className="text-sm font-medium text-primary transition hover:text-primary-strong"
            >
              Back to {nft.type === "characters" ? "characters" : "weapons"}
            </Link>
            <span className="rounded bg-soft px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted">
              {nft.collection}
            </span>
          </div>
        </div>
        <OwnerPanel nft={nft} />
      </section>

      <section className="min-w-0 space-y-5">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          {nft.type === "characters" ? "Character" : "Weapon"}
        </p>
        <h1 className="mt-2 break-words text-3xl font-semibold text-ink sm:text-4xl">
          {nft.name}
        </h1>
        <p className="mt-2 break-all text-sm text-muted">{nft.identifier}</p>

        <MarketPanel nft={nft} />

        {nft.type === "characters" ? (
          <CharacterProfile nft={nft} />
        ) : (
          <WeaponProfile nft={nft} />
        )}

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
