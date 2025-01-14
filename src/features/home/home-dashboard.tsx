import { Activity, BadgeDollarSign, Crosshair, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SearchBox } from "@/features/search/search-box";
import type {
  HomeDistributionItem,
  HomeInsights,
  HomeMarketInsight,
  HomeMarketSegment,
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-surface px-3 py-3 shadow-sm sm:px-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-primary">
      {icon}
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
    </div>
  );
}

const DISTRIBUTION_COLORS = [
  "#0072B2",
  "#D55E00",
  "#009E73",
  "#CC79A7",
  "#E69F00",
  "#56B4E9",
  "#7F3C8D",
  "#F97316",
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#0891B2",
  "#BE123C",
  "#4F46E5",
  "#65A30D",
  "#EA580C",
  "#0F766E",
  "#B45309",
  "#475569",
];

const STAR_COLORS = [
  "#2563EB",
  "#F97316",
  "#16A34A",
  "#DB2777",
  "#7C3AED",
  "#DC2626",
];

function MarketCard({ item }: { item: HomeMarketInsight }) {
  const saleRate = item.total === 0 ? 0 : (item.listed / item.total) * 100;

  return (
    <div className="min-w-0 rounded-md border border-line bg-canvas p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-ink">{item.label}</h3>
        <span className="rounded bg-soft px-2 py-1 text-xs font-medium text-muted">
          {formatNumber(item.listed)} for sale
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted">
          <span>Listed share</span>
          <span className="tabular-nums">{saleRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-soft">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(0, Math.min(100, saleRate))}%` }}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Floor
          </div>
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
          <div className="text-xs uppercase tracking-wide text-muted">NFTs</div>
          <div className="mt-1 font-semibold text-ink">
            {formatNumber(item.total)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketSegmentRow({ item }: { item: HomeMarketSegment }) {
  const saleRate = item.total === 0 ? 0 : (item.listed / item.total) * 100;

  return (
    <div className="grid gap-3 rounded-md border border-line bg-canvas p-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink">{item.label}</div>
          <div className="mt-1 truncate text-xs uppercase tracking-wide text-muted">
            {item.detail}
          </div>
        </div>
        <span className="rounded bg-surface px-2 py-1 text-xs font-medium tabular-nums text-muted">
          {formatNumber(item.total)} NFTs
        </span>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted">
          <span>Listed</span>
          <span className="tabular-nums">
            {formatNumber(item.listed)} / {formatNumber(item.total)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-soft">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(0, Math.min(100, saleRate))}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="block text-xs uppercase tracking-wide text-muted">
            Floor
          </span>
          <span className="mt-1 block font-semibold text-ink">
            {formatPrice(item.floorPrice)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide text-muted">
            Avg price
          </span>
          <span className="mt-1 block font-semibold text-ink">
            {formatPrice(item.averagePrice)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide text-muted">
            Avg value
          </span>
          <span className="mt-1 block font-semibold text-ink">
            {formatPrice(item.averageValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MarketSegmentList({
  title,
  detail,
  items,
}: {
  title: string;
  detail: string;
  items: HomeMarketSegment[];
}) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-canvas p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-muted">{detail}</p>
        </div>
        <span className="rounded bg-surface px-2 py-1 text-xs font-medium tabular-nums text-muted">
          {formatNumber(items.length)} groups
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <MarketSegmentRow key={`${item.detail}-${item.label}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function formatPercent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

const DONUT_RADIUS = 42;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function donutSegments(items: HomeDistributionItem[], total: number) {
  if (items.length === 0 || total <= 0) {
    return [];
  }

  let cursor = 0;
  const gap = items.length > 10 ? 0.35 : 0.9;

  return items.map((item, index) => {
    const rawLength = (item.count / total) * DONUT_CIRCUMFERENCE;
    const dashLength =
      items.length > 1 ? Math.max(0.7, rawLength - gap) : rawLength;
    const segment = {
      item,
      color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
      dashArray: `${dashLength} ${DONUT_CIRCUMFERENCE - dashLength}`,
      dashOffset: -cursor,
    };

    cursor += rawLength;
    return segment;
  });
}

function DonutDistribution({
  title,
  items,
  total,
  className,
  compactLegend = false,
}: {
  title: string;
  items: HomeDistributionItem[];
  total: number;
  className?: string;
  compactLegend?: boolean;
}) {
  const segments = donutSegments(items, total);

  return (
    <section
      aria-label={title}
      className={[
        "min-w-0 rounded-md border border-line bg-surface p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="font-semibold text-ink">{title}</h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div data-testid="trait-donut" className="relative mx-auto h-44 w-44">
          <svg
            role="img"
            aria-label={`${title} distribution`}
            viewBox="0 0 100 100"
            className="h-full w-full overflow-visible"
          >
            <circle
              cx="50"
              cy="50"
              r={DONUT_RADIUS}
              fill="none"
              stroke="rgb(var(--color-soft))"
              strokeWidth="16"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="rgb(var(--color-surface))"
              stroke="rgb(var(--color-line))"
              strokeWidth="1"
            />
            <text textAnchor="middle" fill="rgb(var(--color-muted))">
              <tspan
                x="50"
                y="45"
                className="text-[6px] uppercase tracking-wide"
              >
                Total
              </tspan>
              <tspan
                x="50"
                y="58"
                fill="rgb(var(--color-ink))"
                className="text-[10px] font-semibold"
              >
                {formatNumber(total)}
              </tspan>
            </text>
            {segments.map((segment) => {
              const segmentLabel = `${segment.item.label}: ${formatNumber(
                segment.item.count,
              )} (${formatPercent(segment.item.count, total)})`;

              return (
                <g
                  key={segment.item.label}
                  tabIndex={0}
                  aria-label={segmentLabel}
                  className="group outline-none"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={DONUT_RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="16"
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="butt"
                    transform="rotate(-90 50 50)"
                    className="cursor-help opacity-95 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                    style={{ pointerEvents: "stroke" }}
                  >
                    <title>{segmentLabel}</title>
                  </circle>
                  <foreignObject
                    x="26"
                    y="35"
                    width="48"
                    height="30"
                    className="pointer-events-none hidden group-hover:block group-focus:block"
                  >
                    <div
                      data-testid={`chart-overlay-${segment.item.label}`}
                      className="rounded-md border border-line bg-surface/95 px-1.5 py-1 text-center text-[6px] leading-tight text-ink shadow-lg"
                    >
                      <div className="truncate font-semibold">
                        {segment.item.label}
                      </div>
                      <div className="mt-0.5 tabular-nums text-muted">
                        {formatNumber(segment.item.count)}
                      </div>
                      <div className="tabular-nums text-muted">
                        {formatPercent(segment.item.count, total)}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
        <div
          className={compactLegend ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}
        >
          {items.map((item, index) => (
            <div
              key={item.label}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded border border-line bg-canvas px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-ink/15"
                  style={{
                    backgroundColor:
                      DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
                  }}
                />
                <span className="truncate text-ink">{item.label}</span>
              </span>
              <span className="tabular-nums text-ink">
                {formatNumber(item.count)}
              </span>
              <span className="tabular-nums text-muted">
                {formatPercent(item.count, total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const WEAPON_STAR_COLUMNS = [1, 2, 3, 4, 5, 6];

function starLabel(star: number) {
  return `${star} ${star === 1 ? "star" : "stars"}`;
}

function WeaponStarChart({ rows }: { rows: HomeWeaponStarMatrixRow[] }) {
  const totalWeapons = rows.reduce((total, row) => total + row.total, 0);

  return (
    <div className="min-w-0 rounded-md border border-line bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h3 className="font-semibold text-ink">Weapon star mix</h3>
        <span className="text-sm tabular-nums text-muted">
          {formatNumber(totalWeapons)} weapons
        </span>
      </div>
      <div className="px-4 py-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {WEAPON_STAR_COLUMNS.map((star, index) => (
            <span
              key={star}
              className="inline-flex items-center gap-2 rounded border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-muted"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STAR_COLORS[index] }}
              />
              {starLabel(star)}
            </span>
          ))}
        </div>
        <div className="grid gap-4">
          {rows.map((row) => {
            const counts = new Map(
              row.stars.map((star) => [star.starLevel, star.count]),
            );

            return (
              <div
                key={row.weapon}
                className="rounded-md border border-line bg-canvas p-3"
              >
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_90px] lg:items-center">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {row.weapon}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                      Weapon
                    </div>
                  </div>

                  <div
                    role="img"
                    aria-label={`${row.weapon} star distribution`}
                    className="min-w-0"
                  >
                    <div className="flex h-3 overflow-hidden rounded-full bg-soft">
                      {WEAPON_STAR_COLUMNS.map((star, index) => {
                        const count = counts.get(star) ?? 0;
                        if (count === 0 || row.total === 0) {
                          return null;
                        }

                        return (
                          <span
                            key={star}
                            title={`${row.weapon}: ${formatNumber(count)} ${starLabel(star)} (${formatPercent(count, row.total)})`}
                            className="h-full"
                            style={{
                              width: `${(count / row.total) * 100}%`,
                              backgroundColor: STAR_COLORS[index],
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
                      {WEAPON_STAR_COLUMNS.map((star) => {
                        const count = counts.get(star) ?? 0;
                        return (
                          <span
                            key={star}
                            className="flex items-center justify-between gap-2 rounded border border-line bg-surface px-2 py-1 text-muted"
                          >
                            <span>{starLabel(star)}</span>
                            <span className="font-medium tabular-nums text-ink">
                              {count === 0 ? "-" : formatNumber(count)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-xs uppercase tracking-wide text-muted">
                      Total
                    </div>
                    <div className="mt-1 font-semibold tabular-nums text-ink">
                      {formatNumber(row.total)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HomeDashboard({ stats, insights }: Props) {
  const totalPerks = insights.perkDistribution.reduce(
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

          <div className="grid grid-cols-2 content-end gap-3">
            <Stat label="NFTs covered" value={stats.totalNfts} />
            <Stat label="For sale" value={stats.listedNfts} />
            <Stat label="Sale rate" value={listedRate(stats)} />
            <Stat label="Collections" value={stats.totalCollections} />
            <Stat label="Characters" value={stats.characterCount} />
            <Stat label="Weapons" value={stats.weaponCount} />
          </div>
        </div>
      </section>

      <section
        aria-label="Market overview"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="rounded-md border border-line bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
            <span className="inline-flex min-w-0 items-center gap-2 text-primary">
              <BadgeDollarSign aria-hidden="true" className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-ink">
                Market overview
              </h2>
            </span>
            <span className="rounded bg-soft px-2.5 py-1 text-sm font-medium text-muted">
              {formatNumber(stats.listedNfts)} listed across{" "}
              {formatNumber(stats.totalNfts)} NFTs
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {insights.market.map((item) => (
              <MarketCard key={item.type} item={item} />
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <MarketSegmentList
              title="Character market"
              detail="Species and rarity"
              items={insights.characterMarket}
            />
            <MarketSegmentList
              title="Weapon market"
              detail="Weapon families"
              items={insights.weaponMarket}
            />
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
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.characterRarityBySpecies.map((distribution) => (
            <DonutDistribution
              key={distribution.species}
              title={`${distribution.species} rarities`}
              items={distribution.items}
              total={distribution.total}
            />
          ))}
          <DonutDistribution
            title="Perks"
            items={insights.perkDistribution}
            total={totalPerks}
            className="lg:col-span-2"
            compactLegend
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
        <WeaponStarChart rows={insights.weaponStarMatrix} />
      </section>
    </main>
  );
}
