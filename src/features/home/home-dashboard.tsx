import {
  Activity,
  BadgeDollarSign,
  Boxes,
  Crosshair,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SearchBox } from "@/features/search/search-box";
import type {
  HomeDistributionItem,
  HomeInsights,
  HomeMarketInsight,
  HomeStats,
  HomeWeaponStarMatrixRow,
} from "@/server/data/repository";

type Props = {
  stats: HomeStats;
  insights: HomeInsights;
};

function formatNumber(value: number) {
  return value.toLocaleString("en", { maximumFractionDigits: 2 });
}

function formatPrice(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${formatNumber(value)} EGLD`;
}

function listedRate(stats: HomeStats) {
  if (stats.totalNfts === 0) {
    return "0%";
  }

  return `${((stats.listedNfts / stats.totalNfts) * 100).toFixed(1)}%`;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 text-primary">
      {icon}
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
    </div>
  );
}

function MarketCard({ item }: { item: HomeMarketInsight }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-ink">{item.label}</h3>
        <span className="rounded bg-soft px-2 py-1 text-xs font-medium text-muted">
          {formatNumber(item.listed)} for sale
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">Floor</div>
          <div className="mt-1 font-semibold text-ink">
            {formatPrice(item.floorPrice)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Avg price
          </div>
          <div className="mt-1 font-semibold text-ink">
            {formatPrice(item.averagePrice)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Est. value
          </div>
          <div className="mt-1 font-semibold text-ink">
            {formatPrice(item.averageValue)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            NFTs
          </div>
          <div className="mt-1 font-semibold text-ink">
            {formatNumber(item.total)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DistributionList({
  title,
  items,
  total,
}: {
  title: string;
  items: HomeDistributionItem[];
  total: number;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-sm">
      <h3 className="font-semibold text-ink">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const width = total > 0 ? Math.max(4, (item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="grid gap-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink">{item.label}</span>
                <span className="tabular-nums text-muted">
                  {formatNumber(item.count)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const WEAPON_STAR_COLUMNS = [1, 2, 3, 4, 5, 6];

function WeaponStarMatrix({ rows }: { rows: HomeWeaponStarMatrixRow[] }) {
  return (
    <div className="rounded-md border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-4 py-3">
        <h3 className="font-semibold text-ink">Weapons by star rating</h3>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th
                scope="col"
                className="border-b border-line pb-2 pr-3 text-left font-semibold"
              >
                Weapon
              </th>
              {WEAPON_STAR_COLUMNS.map((star) => (
                <th
                  key={star}
                  scope="col"
                  className="border-b border-line px-2 pb-2 text-right font-semibold"
                >
                  {star} {star === 1 ? "star" : "stars"}
                </th>
              ))}
              <th
                scope="col"
                className="border-b border-line pb-2 pl-3 text-right font-semibold"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const counts = new Map(
                row.stars.map((star) => [star.starLevel, star.count]),
              );
              return (
                <tr key={row.weapon}>
                  <th
                    scope="row"
                    className="border-b border-line py-2 pr-3 text-left font-medium text-ink"
                  >
                    {row.weapon}
                  </th>
                  {WEAPON_STAR_COLUMNS.map((star) => (
                    <td
                      key={star}
                      className="border-b border-line px-2 py-2 text-right tabular-nums text-muted"
                    >
                      {counts.get(star)?.toLocaleString("en") ?? "-"}
                    </td>
                  ))}
                  <td className="border-b border-line py-2 pl-3 text-right font-semibold tabular-nums text-ink">
                    {row.total.toLocaleString("en")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HomeDashboard({ stats, insights }: Props) {
  const totalCharacters = insights.rarityDistribution.reduce(
    (total, item) => total + item.count,
    0,
  );
  const totalPerks = insights.topPerks.reduce(
    (total, item) => total + item.count,
    0,
  );

  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden border-b border-line">
        <Image
          src="/images/bg_MainMenu_Big 1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-18"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-canvas/88 to-canvas" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_430px] lg:px-8 lg:py-14">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Cantina Royale explorer
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
              Cantina Royale Tools
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Browse Cantina Royale characters, weapons, prices, rarity, perks
              and gameplay stats in one fast public dashboard.
            </p>
            <div className="mt-6 max-w-xl">
              <SearchBox />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/collection/All-Characters"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-canvas"
              >
                <Activity aria-hidden="true" className="h-4 w-4" />
                Browse characters
              </Link>
              <Link
                href="/collection/All-Weapons"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-strong hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <Crosshair aria-hidden="true" className="h-4 w-4" />
                Browse weapons
              </Link>
            </div>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-2">
            <Stat label="NFTs covered" value={stats.totalNfts} />
            <Stat label="For sale" value={stats.listedNfts} />
            <Stat label="Sale rate" value={listedRate(stats)} />
            <Stat label="Collections" value={stats.totalCollections} />
            <Stat label="Characters" value={stats.characterCount} />
            <Stat label="Weapons" value={stats.weaponCount} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <SectionTitle
            icon={<BadgeDollarSign aria-hidden="true" className="h-5 w-5" />}
            title="Market overview"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {insights.market.map((item) => (
              <MarketCard key={item.type} item={item} />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle
            icon={<Boxes aria-hidden="true" className="h-5 w-5" />}
            title="Largest collections"
          />
          <div className="grid gap-3">
            {insights.topCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collection/${collection.id}`}
                className="grid grid-cols-[1fr_auto] gap-4 rounded-md border border-line bg-surface p-4 shadow-sm transition hover:border-strong hover:bg-soft"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {collection.name}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {collection.type} -{" "}
                    {formatNumber(collection.listedCount)} for sale - floor{" "}
                    {formatPrice(collection.floorPrice)}
                  </span>
                </span>
                <span className="text-right text-sm font-medium text-ink">
                  {formatNumber(collection.nftCount)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Character traits"
        className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"
      >
        <SectionTitle
          icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
          title="Character traits"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <DistributionList
            title="Rarities"
            items={insights.rarityDistribution}
            total={totalCharacters}
          />
          <DistributionList
            title="Top perks"
            items={insights.topPerks}
            total={totalPerks}
          />
        </div>
      </section>

      <section
        aria-label="Weapon star ratings"
        className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"
      >
        <SectionTitle
          icon={<Crosshair aria-hidden="true" className="h-5 w-5" />}
          title="Weapon star ratings"
        />
        <WeaponStarMatrix rows={insights.weaponStarMatrix} />
      </section>
    </main>
  );
}
