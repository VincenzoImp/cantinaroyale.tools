"use client";

import { Boxes, Crosshair, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type {
  CharacterGameplayDashboard,
  EconomyGameplayDashboard,
  GameplayAmount,
  GameplayEconomyCost,
  GameplayLevelCost,
  GameplayReward,
  WeaponGameplayDashboard,
} from "@/server/data/repository";

type DashboardKind = "characters" | "weapons" | "economy";

const DASHBOARD_LINKS: { id: DashboardKind; label: string; href: string }[] = [
  { id: "characters", label: "Characters", href: "/game-data/characters" },
  { id: "weapons", label: "Weapons", href: "/game-data/weapons" },
  { id: "economy", label: "Economy", href: "/game-data/economy" },
];

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toLocaleString("en", { maximumFractionDigits: 2 });
}

function finiteNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function percentage(value: number | null | undefined, max: number) {
  if (!value || max <= 0) {
    return 0;
  }

  return Math.max(4, Math.min(100, (value / max) * 100));
}

const PLOT_WIDTH = 720;
const PLOT_HEIGHT = 260;
const PLOT_PADDING = { top: 24, right: 70, bottom: 34, left: 56 };
const PLOT_COLORS = [
  "rgb(var(--color-primary))",
  "rgb(var(--color-ink))",
  "rgb(var(--color-strong))",
  "rgb(var(--color-focus))",
];
const panelClass =
  "min-w-0 overflow-hidden rounded-md border border-line bg-surface p-4 shadow-sm";
const controlRowClass = "mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1";
const plotFrameClass =
  "min-w-0 overflow-x-auto rounded border border-line bg-canvas p-3";
const plotSvgClass = "block h-auto w-full overflow-visible";
const diamondSvgClass = "block h-auto w-full overflow-visible";

function plotX(index: number, count: number) {
  const innerWidth = PLOT_WIDTH - PLOT_PADDING.left - PLOT_PADDING.right;
  if (count <= 1) {
    return PLOT_PADDING.left + innerWidth / 2;
  }

  return PLOT_PADDING.left + (index / (count - 1)) * innerWidth;
}

function plotY(value: number | null | undefined, min: number, max: number) {
  const innerHeight = PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;
  if (value === null || value === undefined || max <= min) {
    return PLOT_PADDING.top + innerHeight;
  }

  return PLOT_PADDING.top + (1 - (value - min) / (max - min)) * innerHeight;
}

function numericValues(values: (number | null | undefined)[]) {
  return values.filter((value): value is number => Number.isFinite(value));
}

function rangeFor(values: (number | null | undefined)[], includeZero = true) {
  const numbers = numericValues(values);
  if (numbers.length === 0) {
    return { min: 0, max: 1 };
  }

  const rawMin = Math.min(...numbers);
  const rawMax = Math.max(...numbers);
  const min = includeZero ? Math.min(0, rawMin) : rawMin;
  const max = rawMax === min ? min + 1 : rawMax;

  return { min, max };
}

function polyline(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

const PLOT_TICK_RATIOS = [0, 0.25, 0.5, 0.75, 1];

type PlotTick = {
  x: number;
  label: string;
};

function sparseXTicks<T>(
  items: T[],
  labelFor: (item: T) => string,
): PlotTick[] {
  if (items.length === 0) {
    return [];
  }

  const indexes = [
    ...new Set([0, Math.floor((items.length - 1) / 2), items.length - 1]),
  ];

  return indexes.map((index) => ({
    x: plotX(index, items.length),
    label: labelFor(items[index]!),
  }));
}

function PlotGrid({
  min,
  max,
  xTicks,
  formatY = formatNumber,
}: {
  min: number;
  max: number;
  xTicks: PlotTick[];
  formatY?: (value: number) => string;
}) {
  const innerHeight = PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;

  return (
    <>
      {PLOT_TICK_RATIOS.map((tick) => {
        const y = PLOT_PADDING.top + tick * innerHeight;
        const value = max - (max - min) * tick;

        return (
          <g key={tick}>
            <line
              x1={PLOT_PADDING.left}
              x2={PLOT_WIDTH - PLOT_PADDING.right}
              y1={y}
              y2={y}
              stroke="rgb(var(--color-line))"
              strokeWidth="1"
            />
            <text
              x={PLOT_PADDING.left - 8}
              y={y + 4}
              fill="rgb(var(--color-muted))"
              fontSize="11"
              textAnchor="end"
            >
              {formatY(value)}
            </text>
          </g>
        );
      })}
      {xTicks.map((tick) => (
        <text
          key={`${tick.x}-${tick.label}`}
          x={tick.x}
          y={PLOT_HEIGHT - 8}
          fill="rgb(var(--color-muted))"
          fontSize="12"
          textAnchor="middle"
        >
          {tick.label}
        </text>
      ))}
    </>
  );
}

function formatItemId(itemId: string) {
  return itemId === "CrownDollar" ? "Crown" : itemId;
}

function amountFor(amounts: GameplayAmount[], itemId: string) {
  return amounts
    .filter((amount) => amount.itemId === itemId)
    .reduce((sum, amount) => sum + amount.amount, 0);
}

const COST_CURRENCY_ORDER = ["CrownDollar", "Shards"];

function orderedCostCurrencies(currencies: string[]) {
  return [...currencies].sort((left, right) => {
    const leftIndex = COST_CURRENCY_ORDER.indexOf(left);
    const rightIndex = COST_CURRENCY_ORDER.indexOf(right);

    if (leftIndex !== -1 || rightIndex !== -1) {
      return (
        (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
        (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
      );
    }

    return formatItemId(left).localeCompare(formatItemId(right));
  });
}

function costScore(row: GameplayEconomyCost, currencies: string[]) {
  return currencies.reduce(
    (total, currency) => total + amountFor(row.price, currency),
    0,
  );
}

function highestCostRow(rows: GameplayEconomyCost[], currencies: string[]) {
  return [...rows].sort(
    (left, right) => costScore(right, currencies) - costScore(left, currencies),
  )[0];
}

type CostAxis = {
  itemId: string;
  label: string;
  color: string;
  max: number;
};

function costPlotLabel(axes: CostAxis[]) {
  if (axes.length === 0) {
    return "Upgrade and fuse cost curve plot";
  }

  if (axes.length === 1) {
    return `${axes[0]!.label} cost curve plot`;
  }

  return `${axes[0]!.label} and ${axes[1]!.label} cost curve plot`;
}

function CostCurveGrid({
  axes,
  xTicks,
}: {
  axes: CostAxis[];
  xTicks: PlotTick[];
}) {
  const innerHeight = PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;
  const leftAxis = axes[0];
  const rightAxis = axes[1];

  return (
    <>
      {PLOT_TICK_RATIOS.map((tick) => {
        const y = PLOT_PADDING.top + tick * innerHeight;
        const leftValue = leftAxis ? leftAxis.max - leftAxis.max * tick : 0;
        const rightValue = rightAxis
          ? rightAxis.max - rightAxis.max * tick
          : null;

        return (
          <g key={tick}>
            <line
              x1={PLOT_PADDING.left}
              x2={PLOT_WIDTH - PLOT_PADDING.right}
              y1={y}
              y2={y}
              stroke="rgb(var(--color-line))"
              strokeWidth="1"
            />
            {leftAxis ? (
              <text
                x={PLOT_PADDING.left - 8}
                y={y + 4}
                fill={leftAxis.color}
                fontSize="11"
                textAnchor="end"
              >
                {formatNumber(leftValue)}
              </text>
            ) : null}
            {rightAxis && rightValue !== null ? (
              <text
                x={PLOT_WIDTH - PLOT_PADDING.right + 8}
                y={y + 4}
                fill={rightAxis.color}
                fontSize="11"
                textAnchor="start"
              >
                {formatNumber(rightValue)}
              </text>
            ) : null}
          </g>
        );
      })}
      {xTicks.map((tick) => (
        <text
          key={`${tick.x}-${tick.label}`}
          x={tick.x}
          y={PLOT_HEIGHT - 8}
          fill="rgb(var(--color-muted))"
          fontSize="12"
          textAnchor="middle"
        >
          {tick.label}
        </text>
      ))}
    </>
  );
}

function selectedClass(active: boolean) {
  return active
    ? "border-primary bg-soft text-primary"
    : "border-line bg-canvas text-ink hover:border-strong hover:bg-soft";
}

function formatAmount(amount: GameplayAmount) {
  return `${formatNumber(amount.amount)} ${formatItemId(amount.itemId)}`;
}

function formatAmounts(amounts: GameplayAmount[]) {
  if (amounts.length === 0) {
    return "-";
  }

  return amounts.map(formatAmount).join(" + ");
}

function formatRewardAmount(reward: GameplayReward) {
  if (reward.amountMin === null && reward.amountMax === null) {
    return "";
  }

  if (
    reward.amountMin !== null &&
    reward.amountMax !== null &&
    reward.amountMin !== reward.amountMax
  ) {
    return `${formatNumber(reward.amountMin)}-${formatNumber(reward.amountMax)}`;
  }

  return formatNumber(reward.amountMin ?? reward.amountMax);
}

function formatReward(reward: GameplayReward) {
  const amount = formatRewardAmount(reward);
  const rewardName = reward.rewardId ?? reward.rewardType;
  const chance =
    reward.chance !== null && reward.chance !== undefined && reward.chance < 100
      ? ` (${formatNumber(reward.chance)}% chance)`
      : "";

  return `${amount ? `${amount} ` : ""}${rewardName}${chance}`;
}

function formatRewards(rewards: GameplayReward[]) {
  if (rewards.length === 0) {
    return "-";
  }

  return rewards.map(formatReward).join(", ");
}

function costSubtitle(cost: GameplayLevelCost) {
  if (cost.requiredTokens !== undefined) {
    return `${formatNumber(cost.requiredTokens)} tokens`;
  }

  if (cost.xpNeeded !== undefined) {
    return `${formatNumber(cost.xpNeeded)} XP`;
  }

  return "-";
}

function PageShell({
  active,
  eyebrow,
  title,
  description,
  children,
}: {
  active: DashboardKind;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>

        <nav
          aria-label="Game data views"
          className="flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1 lg:justify-end"
        >
          {DASHBOARD_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              aria-current={active === link.id ? "page" : undefined}
              className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${
                active === link.id
                  ? "border-primary bg-soft text-primary"
                  : "border-line bg-surface text-ink hover:border-strong hover:bg-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}
    </main>
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

function CharacterProgressionPanel({
  rows,
  profiles,
}: {
  rows: CharacterGameplayDashboard["levelProgression"];
  profiles: CharacterGameplayDashboard["profileProgression"];
}) {
  const fallbackProfiles = rows.length
    ? [
        {
          key: "average",
          label: "Average",
          species: "All NFT profiles",
          rarity: "Average",
          levels: rows.map((row) => ({
            level: row.level,
            health: row.averageHealth,
            shield: row.averageShield,
            talentPoints: row.talentPoints,
            skillLevel: row.skillLevel,
            crownEarnRate: row.crownEarnRate,
          })),
        },
      ]
    : [];
  const series = profiles.length > 0 ? profiles : fallbackProfiles;
  const metrics = [
    {
      key: "health",
      label: "Health",
      value: (level: (typeof series)[number]["levels"][number]) => level.health,
    },
    {
      key: "shield",
      label: "Shield",
      value: (level: (typeof series)[number]["levels"][number]) => level.shield,
    },
    {
      key: "earn",
      label: "Earn rate",
      value: (level: (typeof series)[number]["levels"][number]) =>
        level.crownEarnRate,
    },
    {
      key: "talent",
      label: "Talent",
      value: (level: (typeof series)[number]["levels"][number]) =>
        level.talentPoints,
    },
    {
      key: "skill",
      label: "Skill",
      value: (level: (typeof series)[number]["levels"][number]) =>
        level.skillLevel,
    },
  ];
  const [selectedMetricKey, setSelectedMetricKey] = useState(
    metrics[0]?.key ?? "",
  );
  const selectedMetric =
    metrics.find((metric) => metric.key === selectedMetricKey) ?? metrics[0];
  const [selectedProfileKey, setSelectedProfileKey] = useState(
    series[0]?.key ?? "",
  );
  const activeProfile =
    series.find((profile) => profile.key === selectedProfileKey) ?? series[0];
  const [selectedLevel, setSelectedLevel] = useState(
    activeProfile?.levels.at(-1)?.level ?? 0,
  );
  const selected =
    activeProfile?.levels.find((level) => level.level === selectedLevel) ??
    activeProfile?.levels.at(-1);
  const { min, max } = rangeFor(
    series.flatMap((profile) =>
      profile.levels.map((level) => selectedMetric?.value(level)),
    ),
  );
  const xTicks = sparseXTicks(activeProfile?.levels ?? [], (level) =>
    String(level.level),
  );

  return (
    <section className={panelClass}>
      <SectionTitle
        icon={<Boxes aria-hidden="true" className="h-5 w-5" />}
        title="Character growth plot"
      />
      <div className={controlRowClass}>
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            aria-pressed={metric.key === selectedMetric?.key}
            aria-label={`${metric.label} growth metric`}
            onClick={() => setSelectedMetricKey(metric.key)}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              metric.key === selectedMetric?.key,
            )}`}
          >
            {metric.label}
          </button>
        ))}
      </div>
      <div className={controlRowClass}>
        {series.map((profile) => (
          <button
            key={profile.key}
            type="button"
            aria-pressed={profile.key === activeProfile?.key}
            onClick={() => {
              setSelectedProfileKey(profile.key);
              setSelectedLevel(profile.levels.at(-1)?.level ?? 0);
            }}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              profile.key === activeProfile?.key,
            )}`}
          >
            {profile.label}
          </button>
        ))}
      </div>
      <div className={plotFrameClass}>
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
          {series.map((profile, index) => (
            <span key={profile.key} className="inline-flex items-center gap-2">
              <span
                className="h-2 w-6 rounded-full"
                style={{
                  backgroundColor: PLOT_COLORS[index % PLOT_COLORS.length],
                  opacity: profile.key === activeProfile?.key ? 1 : 0.45,
                }}
              />
              {profile.label}
            </span>
          ))}
        </div>
        <svg
          aria-label="Character profile growth plot"
          className={plotSvgClass}
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          role="img"
        >
          <PlotGrid min={min} max={max} xTicks={xTicks} />
          {series.map((profile, profileIndex) => {
            const points = profile.levels.map((level, index) => ({
              x: plotX(index, profile.levels.length),
              y: plotY(selectedMetric?.value(level), min, max),
            }));

            return points.length > 1 ? (
              <polyline
                key={profile.key}
                fill="none"
                points={polyline(points)}
                stroke={PLOT_COLORS[profileIndex % PLOT_COLORS.length]}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={profile.key === activeProfile?.key ? 3 : 2}
                opacity={profile.key === activeProfile?.key ? 1 : 0.45}
              />
            ) : null;
          })}
          {series.flatMap((profile) =>
            profile.levels.map((level, index) => {
              const active =
                selected?.level === level.level &&
                profile.key === activeProfile?.key;
              const x = plotX(index, profile.levels.length);
              const y = plotY(selectedMetric?.value(level), min, max);

              return (
                <circle
                  key={`${profile.key}-${level.level}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`${profile.label} level ${level.level} ${selectedMetric?.label.toLowerCase()} details`}
                  cx={x}
                  cy={y}
                  r={active ? 7 : 4}
                  fill={
                    active
                      ? "rgb(var(--color-primary))"
                      : "rgb(var(--color-surface))"
                  }
                  opacity={profile.key === activeProfile?.key ? 1 : 0.55}
                  stroke="rgb(var(--color-primary))"
                  strokeWidth="2"
                  onClick={() => {
                    setSelectedProfileKey(profile.key);
                    setSelectedLevel(level.level);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedProfileKey(profile.key);
                      setSelectedLevel(level.level);
                    }
                  }}
                />
              );
            }),
          )}
        </svg>
      </div>
      {selected && selectedMetric && activeProfile ? (
        <div className="mt-4 min-w-0 rounded border border-line bg-canvas p-3">
          <h3 className="font-semibold text-ink">
            Level {selected.level} details
          </h3>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Profile
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {activeProfile.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Metric
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {selectedMetric.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Health
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatNumber(selected.health)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Shield
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatNumber(selected.shield)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Talent
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatNumber(selected.talentPoints)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Skill
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatNumber(selected.skillLevel)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Earn rate
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatNumber(selected.crownEarnRate)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}

type DiamondProfile = {
  key: string;
  label: string;
  species?: string;
  rarity?: string;
  stats: {
    label: string;
    value: number | null;
  }[];
};

const DIAMOND_WIDTH = 460;
const DIAMOND_HEIGHT = 330;
const DIAMOND_CENTER = { x: DIAMOND_WIDTH / 2, y: 158 };
const DIAMOND_RADIUS = 96;

function axisPoint(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;

  return {
    x: DIAMOND_CENTER.x + Math.cos(angle) * radius,
    y: DIAMOND_CENTER.y + Math.sin(angle) * radius,
  };
}

function statValue(profile: DiamondProfile, axis: string) {
  return (
    profile.stats.find(
      (stat) => stat.label.toLowerCase() === axis.toLowerCase(),
    )?.value ?? null
  );
}

function lowerIsBetter(axis: string) {
  return /reload/i.test(axis);
}

function normalizedStatValue(
  axis: string,
  value: number | null,
  range: { min: number; max: number } | undefined,
) {
  if (value === null || !range) {
    return 0;
  }

  if (range.max <= range.min) {
    return value > 0 ? 0.75 : 0;
  }

  const ratio = (value - range.min) / (range.max - range.min);
  return Math.max(0, Math.min(1, lowerIsBetter(axis) ? 1 - ratio : ratio));
}

function diamondPoints(
  profile: DiamondProfile,
  axes: string[],
  ranges: Map<string, { min: number; max: number }>,
) {
  return axes
    .map((axis, index) => {
      const normalized = normalizedStatValue(
        axis,
        statValue(profile, axis),
        ranges.get(axis),
      );
      return axisPoint(index, axes.length, DIAMOND_RADIUS * normalized);
    })
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

function averageProfile(
  profiles: DiamondProfile[],
  axes: string[],
): DiamondProfile {
  return {
    key: "average",
    label: "Average",
    stats: axes.map((axis) => {
      const values = profiles
        .map((profile) => statValue(profile, axis))
        .filter((value): value is number => Number.isFinite(value));
      const value =
        values.length > 0
          ? values.reduce((sum, item) => sum + item, 0) / values.length
          : null;

      return { label: axis, value };
    }),
  };
}

function DiamondPlotPanel({
  title,
  ariaLabel,
  icon,
  profiles,
}: {
  title: string;
  ariaLabel: string;
  icon: ReactNode;
  profiles: DiamondProfile[];
}) {
  const axes = useMemo(() => {
    const seen = new Set<string>();
    const labels: string[] = [];

    for (const profile of profiles) {
      for (const stat of profile.stats) {
        if (stat.value === null || seen.has(stat.label)) {
          continue;
        }
        seen.add(stat.label);
        labels.push(stat.label);
      }
    }

    return labels;
  }, [profiles]);
  const ranges = useMemo(() => {
    const ranges = new Map<string, { min: number; max: number }>();

    for (const axis of axes) {
      const values = profiles
        .map((profile) => statValue(profile, axis))
        .filter((value): value is number => Number.isFinite(value));
      if (values.length > 0) {
        ranges.set(axis, {
          min: Math.min(...values),
          max: Math.max(...values),
        });
      }
    }

    return ranges;
  }, [axes, profiles]);
  const [selectedKey, setSelectedKey] = useState(profiles[0]?.key ?? "");
  const selected =
    profiles.find((profile) => profile.key === selectedKey) ?? profiles[0];
  const average = averageProfile(profiles, axes);

  if (!selected || axes.length < 3) {
    return null;
  }

  return (
    <section className={panelClass}>
      <SectionTitle icon={icon} title={title} />
      <div className={controlRowClass}>
        {profiles.map((profile) => (
          <button
            key={profile.key}
            type="button"
            aria-pressed={profile.key === selected.key}
            aria-label={`${profile.label} stat diamond`}
            onClick={() => setSelectedKey(profile.key)}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              profile.key === selected.key,
            )}`}
          >
            {profile.label}
          </button>
        ))}
      </div>
      <div className={plotFrameClass}>
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-6 rounded-full"
              style={{ backgroundColor: PLOT_COLORS[0] }}
            />
            {selected.label}
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-6 rounded-full"
              style={{ backgroundColor: PLOT_COLORS[2] }}
            />
            Average
          </span>
        </div>
        <svg
          aria-label={ariaLabel}
          className={diamondSvgClass}
          viewBox={`0 0 ${DIAMOND_WIDTH} ${DIAMOND_HEIGHT}`}
          role="img"
        >
          {[0.25, 0.5, 0.75, 1].map((radius) => (
            <polygon
              key={radius}
              fill="none"
              points={axes
                .map((_, index) =>
                  axisPoint(index, axes.length, DIAMOND_RADIUS * radius),
                )
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              stroke="rgb(var(--color-line))"
              strokeWidth="1"
            />
          ))}
          {axes.map((axis, index) => {
            const end = axisPoint(index, axes.length, DIAMOND_RADIUS);
            const label = axisPoint(index, axes.length, DIAMOND_RADIUS + 38);

            return (
              <g key={axis}>
                <line
                  x1={DIAMOND_CENTER.x}
                  x2={end.x}
                  y1={DIAMOND_CENTER.y}
                  y2={end.y}
                  stroke="rgb(var(--color-line))"
                  strokeWidth="1"
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="rgb(var(--color-muted))"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {axis}
                </text>
              </g>
            );
          })}
          <polygon
            fill="none"
            points={diamondPoints(average, axes, ranges)}
            stroke={PLOT_COLORS[2]}
            strokeDasharray="5 5"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <polygon
            fill={PLOT_COLORS[0]}
            fillOpacity="0.16"
            points={diamondPoints(selected, axes, ranges)}
            stroke={PLOT_COLORS[0]}
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </div>
      <dl className="mt-4 grid min-w-0 gap-3 rounded border border-line bg-canvas p-3 text-sm sm:grid-cols-3">
        {axes.map((axis) => (
          <div key={axis}>
            <dt className="text-xs uppercase tracking-wide text-muted">
              {axis}
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {formatNumber(statValue(selected, axis))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CharacterStatDiamond({
  profiles,
}: {
  profiles: CharacterGameplayDashboard["statProfiles"];
}) {
  return (
    <DiamondPlotPanel
      title="Character stat diamond"
      ariaLabel="Character stat diamond plot"
      icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
      profiles={profiles}
    />
  );
}

function WeaponStatDiamond({
  rows,
}: {
  rows: WeaponGameplayDashboard["baseStats"];
}) {
  const profiles = rows.map((row) => ({
    key: row.weapon,
    label: row.weapon,
    stats: row.stats.map((stat) => ({
      label: stat.label,
      value: finiteNumber(stat.value),
    })),
  }));

  return (
    <DiamondPlotPanel
      title="Weapon stat diamond"
      ariaLabel="Weapon stat diamond plot"
      icon={<Crosshair aria-hidden="true" className="h-5 w-5" />}
      profiles={profiles}
    />
  );
}

function LevelCostTable({
  title,
  costs,
}: {
  title: string;
  costs: GameplayLevelCost[];
}) {
  const [selectedLevel, setSelectedLevel] = useState(costs[0]?.level ?? 0);
  const selected =
    costs.find((cost) => cost.level === selectedLevel) ?? costs[0];
  const series = [
    {
      key: "requirement",
      label: costs.some((cost) => cost.requiredTokens !== undefined)
        ? "Tokens"
        : "XP",
      color: PLOT_COLORS[0],
      values: costs.map((cost) => cost.requiredTokens ?? cost.xpNeeded ?? 0),
    },
    {
      key: "shards",
      label: "Shards",
      color: PLOT_COLORS[1],
      values: costs.map((cost) => amountFor(cost.price, "Shards")),
    },
    {
      key: "crown",
      label: "Crown",
      color: PLOT_COLORS[2],
      values: costs.map(
        (cost) =>
          amountFor(cost.price, "Crown") + amountFor(cost.price, "CrownDollar"),
      ),
    },
  ].filter((item) => item.values.some((value) => value > 0));
  const xTicks = sparseXTicks(costs, (cost) => String(cost.level));

  return (
    <section className={panelClass}>
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 border-t border-line pt-4">
        <div className={plotFrameClass}>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
            {series.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-2">
                <span
                  className="h-2 w-6 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
          <svg
            aria-label={`${title} plot`}
            className={plotSvgClass}
            viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
            role="img"
          >
            <PlotGrid
              min={0}
              max={100}
              xTicks={xTicks}
              formatY={(value) => `${formatNumber(value)}%`}
            />
            {series.map((item) => {
              const max = Math.max(...item.values, 1);
              const points = item.values.map((value, index) => ({
                x: plotX(index, costs.length),
                y: plotY((value / max) * 100, 0, 100),
              }));

              return (
                <polyline
                  key={item.key}
                  fill="none"
                  points={polyline(points)}
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              );
            })}
            {costs.map((cost, index) => {
              const active = selected?.level === cost.level;
              const requirement = cost.requiredTokens ?? cost.xpNeeded ?? 0;
              const maxRequirement = Math.max(
                ...costs.map(
                  (item) => item.requiredTokens ?? item.xpNeeded ?? 0,
                ),
                1,
              );
              const x = plotX(index, costs.length);
              const y = plotY((requirement / maxRequirement) * 100, 0, 100);

              return (
                <circle
                  key={cost.level}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`Level ${cost.level} cost details`}
                  cx={x}
                  cy={y}
                  r={active ? 7 : 5}
                  fill={
                    active
                      ? "rgb(var(--color-primary))"
                      : "rgb(var(--color-surface))"
                  }
                  stroke="rgb(var(--color-primary))"
                  strokeWidth="2"
                  onClick={() => setSelectedLevel(cost.level)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedLevel(cost.level);
                    }
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>
      {selected ? (
        <div className="mt-4 min-w-0 rounded border border-line bg-canvas p-3">
          <h3 className="font-semibold text-ink">Level {selected.level}</h3>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Requirement
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {costSubtitle(selected)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Cost
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatAmounts(selected.price)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Reward
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatRewards(selected.rewards)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}

function perkRange(label: string, min: number | null, max: number | null) {
  if (min === null && max === null) {
    return null;
  }

  const value = [min, max]
    .filter((item): item is number => item !== null)
    .map(formatNumber)
    .join(" - ");

  return `${label} ${value}`;
}

function PerkReferencePanel({
  perks,
}: {
  perks: CharacterGameplayDashboard["perks"];
}) {
  if (perks.length === 0) {
    return null;
  }

  return (
    <section className={panelClass}>
      <SectionTitle
        icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
        title="Perk reference"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {perks.map((perk) => {
          const ranges = [
            perkRange("Roll", perk.minRoll, perk.maxRoll),
            perkRange("Coefficient", perk.minCoefficient, perk.maxCoefficient),
          ].filter((item): item is string => item !== null);

          return (
            <article
              key={perk.id}
              className="min-w-0 rounded border border-line bg-canvas p-3"
            >
              <h3 className="font-semibold text-ink">{perk.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {perk.description}
              </p>
              {ranges.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ranges.map((range) => (
                    <span
                      key={range}
                      className="rounded bg-soft px-2 py-1 text-xs font-medium text-muted"
                    >
                      {range}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WeaponDamageByStar({
  bonuses,
}: {
  bonuses: WeaponGameplayDashboard["starBonuses"];
}) {
  const grouped = useMemo(() => {
    const grouped = new Map<string, WeaponGameplayDashboard["starBonuses"]>();
    for (const bonus of bonuses) {
      const current = grouped.get(bonus.weapon) ?? [];
      current.push(bonus);
      grouped.set(bonus.weapon, current);
    }
    return grouped;
  }, [bonuses]);
  const weapons = [...grouped.keys()];
  const [selectedWeapon, setSelectedWeapon] = useState(weapons[0] ?? "");
  const starLevels = [...new Set(bonuses.map((bonus) => bonus.starLevel))].sort(
    (left, right) => left - right,
  );
  const starIndex = new Map(
    starLevels.map((starLevel, index) => [starLevel, index] as const),
  );
  const weaponBonuses = grouped.get(selectedWeapon) ?? bonuses.slice(0, 0);
  const [selectedStar, setSelectedStar] = useState(
    weaponBonuses[0]?.starLevel ?? 0,
  );
  const activeWeapon = grouped.has(selectedWeapon)
    ? selectedWeapon
    : (weapons[0] ?? "");
  const activeWeaponBonuses = grouped.get(activeWeapon) ?? [];
  const selected =
    activeWeaponBonuses.find((bonus) => bonus.starLevel === selectedStar) ??
    activeWeaponBonuses[0];
  const { min, max } = rangeFor(bonuses.map((bonus) => bonus.damageIncrease));
  const xTicks = starLevels.map((starLevel, index) => ({
    x: plotX(index, starLevels.length),
    label: `${starLevel}*`,
  }));

  return (
    <section className={panelClass}>
      <SectionTitle
        icon={<Crosshair aria-hidden="true" className="h-5 w-5" />}
        title="Weapon damage plot"
      />
      <div className={controlRowClass}>
        {weapons.map((weapon) => (
          <button
            key={weapon}
            type="button"
            aria-pressed={weapon === activeWeapon}
            onClick={() => {
              setSelectedWeapon(weapon);
              setSelectedStar(grouped.get(weapon)?.[0]?.starLevel ?? 0);
            }}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              weapon === activeWeapon,
            )}`}
          >
            {weapon}
          </button>
        ))}
      </div>
      <div className={plotFrameClass}>
        <svg
          aria-label="Weapon damage by star plot"
          className={plotSvgClass}
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          role="img"
        >
          <PlotGrid
            min={min}
            max={max}
            xTicks={xTicks}
            formatY={(value) => `${formatNumber(value)}%`}
          />
          {weapons.map((weapon, weaponIndex) => {
            const rows = grouped.get(weapon) ?? [];
            const points = rows.map((bonus) => ({
              x: plotX(starIndex.get(bonus.starLevel) ?? 0, starLevels.length),
              y: plotY(bonus.damageIncrease, min, max),
            }));

            return points.length > 1 ? (
              <polyline
                key={weapon}
                fill="none"
                points={polyline(points)}
                stroke={PLOT_COLORS[weaponIndex % PLOT_COLORS.length]}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={weapon === activeWeapon ? 3 : 2}
                opacity={weapon === activeWeapon ? 1 : 0.45}
              />
            ) : null;
          })}
          {bonuses.map((bonus) => {
            const active =
              selected?.starLevel === bonus.starLevel &&
              bonus.weapon === activeWeapon;
            const x = plotX(
              starIndex.get(bonus.starLevel) ?? 0,
              starLevels.length,
            );
            const y = plotY(bonus.damageIncrease, min, max);

            return (
              <circle
                key={`${bonus.weapon}-${bonus.starLevel}`}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`${bonus.weapon} star ${bonus.starLevel} damage details`}
                cx={x}
                cy={y}
                r={active ? 7 : 4}
                fill={
                  active
                    ? "rgb(var(--color-primary))"
                    : "rgb(var(--color-surface))"
                }
                opacity={bonus.weapon === activeWeapon ? 1 : 0.55}
                stroke="rgb(var(--color-primary))"
                strokeWidth="2"
                onClick={() => {
                  setSelectedWeapon(bonus.weapon);
                  setSelectedStar(bonus.starLevel);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedWeapon(bonus.weapon);
                    setSelectedStar(bonus.starLevel);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>
      {selected ? (
        <div className="mt-4 min-w-0 rounded border border-line bg-canvas p-3">
          <h3 className="font-semibold text-ink">
            {selected.weapon} star {selected.starLevel}
          </h3>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Damage
              </dt>
              <dd className="mt-1 font-medium text-ink">
                +{formatNumber(selected.damageIncrease)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Extra stat
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {selected.statLabel && selected.statValue !== null
                  ? `${selected.statLabel} +${formatNumber(selected.statValue)}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Fuse cost
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatAmounts(selected.fusePrice)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Reward
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatRewards(selected.fuseRewards)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}

function WeaponBaseStats({
  rows,
}: {
  rows: WeaponGameplayDashboard["baseStats"];
}) {
  const statLabels = [
    ...new Set(rows.flatMap((row) => row.stats.map((stat) => stat.label))),
  ];
  const [selectedStat, setSelectedStat] = useState(statLabels[0] ?? "");
  const values = rows
    .map((row) => {
      const value = finiteNumber(
        row.stats.find((stat) => stat.label === selectedStat)?.value,
      );
      return { weapon: row.weapon, value };
    })
    .filter(
      (row): row is { weapon: string; value: number } => row.value !== null,
    )
    .sort((left, right) => right.value - left.value);
  const max = Math.max(...values.map((row) => row.value), 1);

  return (
    <section className={panelClass}>
      <SectionTitle
        icon={<Boxes aria-hidden="true" className="h-5 w-5" />}
        title="Weapon stat comparison"
      />
      <div className={controlRowClass}>
        {statLabels.map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={label === selectedStat}
            aria-label={`${label} stat comparison`}
            onClick={() => setSelectedStat(label)}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              label === selectedStat,
            )}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid min-w-0 gap-2 rounded border border-line bg-canvas p-3">
        {values.map((row) => (
          <div
            key={row.weapon}
            className="grid gap-2 text-sm sm:grid-cols-[140px_minmax(0,1fr)_72px] sm:items-center"
          >
            <span className="font-medium text-ink">{row.weapon}</span>
            <div className="h-3 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percentage(row.value, max)}%` }}
              />
            </div>
            <span className="tabular-nums text-muted sm:text-right">
              {formatNumber(row.value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CurrencyUsagePanel({
  rows,
  costs,
}: {
  rows: EconomyGameplayDashboard["currencyUsage"];
  costs: EconomyGameplayDashboard["upgradeCosts"];
}) {
  const sinkRows = useMemo(() => {
    const grouped = new Map<
      string,
      { category: string; itemId: string; totalAmount: number; uses: number }
    >();
    for (const cost of costs) {
      for (const amount of cost.price) {
        if (amount.amount <= 0) {
          continue;
        }
        const key = `${cost.category}-${amount.itemId}`;
        const current =
          grouped.get(key) ??
          ({
            category: cost.category,
            itemId: amount.itemId,
            totalAmount: 0,
            uses: 0,
          } satisfies {
            category: string;
            itemId: string;
            totalAmount: number;
            uses: number;
          });
        current.totalAmount += amount.amount;
        current.uses += 1;
        grouped.set(key, current);
      }
    }

    return [...grouped.values()].sort(
      (left, right) =>
        left.category.localeCompare(right.category) ||
        left.itemId.localeCompare(right.itemId),
    );
  }, [costs]);
  const [selectedItemId, setSelectedItemId] = useState(rows[0]?.itemId ?? "");
  const selected = rows.find((row) => row.itemId === selectedItemId) ?? rows[0];
  const activeItemId = selected?.itemId ?? "";
  const activeSinkRows = sinkRows.filter((row) => row.itemId === activeItemId);
  const maxAmount = Math.max(
    ...activeSinkRows.map((row) => row.totalAmount),
    1,
  );
  const innerHeight = PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;
  const innerWidth = PLOT_WIDTH - PLOT_PADDING.left - PLOT_PADDING.right;
  const barWidth =
    activeSinkRows.length > 0 ? innerWidth / activeSinkRows.length : innerWidth;

  return (
    <section className={panelClass}>
      <SectionTitle
        icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
        title="Currency usage by resource"
      />
      <div className={controlRowClass}>
        {rows.map((row) => (
          <button
            key={row.itemId}
            type="button"
            aria-pressed={selected?.itemId === row.itemId}
            aria-label={`${formatItemId(row.itemId)} currency usage details`}
            onClick={() => setSelectedItemId(row.itemId)}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              selected?.itemId === row.itemId,
            )}`}
          >
            {formatItemId(row.itemId)}
          </button>
        ))}
      </div>
      <div className={plotFrameClass}>
        <svg
          aria-label="Currency usage by resource plot"
          className={plotSvgClass}
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          role="img"
        >
          <PlotGrid min={0} max={maxAmount} xTicks={[]} />
          {activeSinkRows.map((row, index) => {
            const height = (row.totalAmount / maxAmount) * innerHeight;
            const x = PLOT_PADDING.left + index * barWidth + 4;
            const y = PLOT_PADDING.top + innerHeight - height;

            return (
              <g key={`${row.category}-${row.itemId}`}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(10, barWidth - 8)}
                  height={height}
                  rx="4"
                  fill="rgb(var(--color-primary))"
                />
                <text
                  x={x + Math.max(10, barWidth - 8) / 2}
                  y={PLOT_HEIGHT - 8}
                  fill="rgb(var(--color-muted))"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {row.category.replace(" upgrade", "").replace("Weapon ", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.itemId}
            className="grid min-w-0 gap-1 rounded border border-line bg-canvas p-3"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">
                {formatItemId(row.itemId)}
              </span>
              <span className="tabular-nums text-muted">
                {formatNumber(row.totalAmount)} across {row.uses}{" "}
                {row.uses === 1 ? "cost" : "costs"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selected ? (
        <div className="mt-4 min-w-0 rounded border border-line bg-canvas p-3">
          <h3 className="font-semibold text-ink">
            {formatItemId(selected.itemId)}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {formatNumber(selected.totalAmount)} {formatItemId(selected.itemId)}{" "}
            across {selected.uses.toLocaleString("en")} upgrade and fuse costs.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function EconomyCostTable({
  rows,
}: {
  rows: EconomyGameplayDashboard["upgradeCosts"];
}) {
  const groups = useMemo(() => {
    const grouped = new Map<string, GameplayEconomyCost[]>();
    for (const row of rows) {
      const current = grouped.get(row.category) ?? [];
      current.push(row);
      grouped.set(row.category, current);
    }

    return [...grouped.entries()]
      .map(([category, costs]) => ({
        category,
        costs,
        currencies: [
          ...new Set(
            costs.flatMap((cost) =>
              cost.price
                .filter((amount) => amount.amount > 0)
                .map((amount) => amount.itemId),
            ),
          ),
        ],
        maxCost: Math.max(
          ...costs.flatMap((cost) => cost.price.map((amount) => amount.amount)),
          0,
        ),
      }))
      .sort((left, right) => right.maxCost - left.maxCost);
  }, [rows]);
  const [selectedCategory, setSelectedCategory] = useState(
    groups[0]?.category ?? "",
  );
  const activeGroup =
    groups.find((group) => group.category === selectedCategory) ?? groups[0];
  const activeRows = activeGroup?.costs ?? [];
  const activeCurrencies = orderedCostCurrencies(
    activeGroup?.currencies ?? [],
  ).slice(0, 2);
  const axes: CostAxis[] = activeCurrencies.map((currency, index) => ({
    itemId: currency,
    label: formatItemId(currency),
    color: PLOT_COLORS[index],
    max: Math.max(
      ...activeRows.map((row) => amountFor(row.price, currency)),
      1,
    ),
  }));
  const initialCost =
    groups[0] && groups[0].currencies.length > 0
      ? highestCostRow(
          groups[0].costs,
          orderedCostCurrencies(groups[0].currencies).slice(0, 2),
        )
      : undefined;
  const [selectedKey, setSelectedKey] = useState(
    initialCost ? `${initialCost.category}-${initialCost.label}` : "",
  );
  const selected =
    activeRows.find((row) => `${row.category}-${row.label}` === selectedKey) ??
    highestCostRow(activeRows, activeCurrencies);
  const series = axes.map((axis) => ({
    axis,
    points: activeRows.map((row, index) => ({
      x: plotX(index, activeRows.length),
      y: plotY(amountFor(row.price, axis.itemId), 0, axis.max),
    })),
  }));
  const xTicks = sparseXTicks(
    activeRows.map((_, index) => index),
    (index) => String(index + 1),
  );

  return (
    <section className={panelClass}>
      <h2 className="font-semibold text-ink">Cost curve</h2>
      <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto border-t border-line pt-4 pb-1">
        {groups.map((group) => (
          <button
            key={group.category}
            type="button"
            aria-pressed={group.category === activeGroup?.category}
            onClick={() => {
              setSelectedCategory(group.category);
              const nextCurrencies = orderedCostCurrencies(
                group.currencies,
              ).slice(0, 2);
              const highest = highestCostRow(group.costs, nextCurrencies);
              setSelectedKey(
                highest ? `${highest.category}-${highest.label}` : "",
              );
            }}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium ${selectedClass(
              group.category === activeGroup?.category,
            )}`}
          >
            {group.category}
          </button>
        ))}
      </div>
      {axes.length > 0 ? (
        <div className="mb-3 flex min-w-0 flex-wrap gap-2">
          {axes.map((axis, index) => (
            <span
              key={axis.itemId}
              className="inline-flex items-center gap-2 rounded bg-canvas px-2.5 py-1 text-xs font-medium text-muted"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: axis.color }}
              />
              {axis.label} {index === 0 ? "left axis" : "right axis"}
            </span>
          ))}
        </div>
      ) : null}
      <div className={`${plotFrameClass} mt-3`}>
        <svg
          aria-label={costPlotLabel(axes)}
          className={plotSvgClass}
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          role="img"
        >
          <CostCurveGrid axes={axes} xTicks={xTicks} />
          {series.map(({ axis, points }) => (
            <polyline
              key={axis.itemId}
              fill="none"
              points={polyline(points)}
              stroke={axis.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          ))}
          {series.map(({ axis }, axisIndex) =>
            activeRows.map((row, index) => {
              const key = `${row.category}-${row.label}`;
              const active = selected
                ? key === `${selected.category}-${selected.label}`
                : false;
              const x = plotX(index, activeRows.length);
              const y = plotY(amountFor(row.price, axis.itemId), 0, axis.max);
              const interactive = axisIndex === 0;

              return (
                <circle
                  key={`${axis.itemId}-${key}`}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-hidden={interactive ? undefined : true}
                  aria-pressed={interactive ? active : undefined}
                  aria-label={
                    interactive
                      ? `${row.category} ${row.label} cost details`
                      : undefined
                  }
                  cx={x}
                  cy={y}
                  r={active ? 7 : 5}
                  fill={active ? axis.color : "rgb(var(--color-surface))"}
                  stroke={axis.color}
                  strokeWidth="2"
                  onClick={() => {
                    if (interactive) {
                      setSelectedKey(key);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      interactive &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      setSelectedKey(key);
                    }
                  }}
                />
              );
            }),
          )}
        </svg>
      </div>
      {selected ? (
        <div className="mt-4 min-w-0 rounded border border-line bg-canvas p-3">
          <h3 className="font-semibold text-ink">{selected.label}</h3>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Resources
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {axes.length > 0
                  ? axes.map((axis) => axis.label).join(" / ")
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Type
              </dt>
              <dd className="mt-1 font-medium text-ink">{selected.category}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Requirement
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {selected.requirement ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Cost
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatAmounts(selected.price)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Reward
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatRewards(selected.rewards)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}

export function CharacterGameplayDashboardPage({
  dashboard,
}: {
  dashboard: CharacterGameplayDashboard;
}) {
  return (
    <PageShell
      active="characters"
      eyebrow="Game data"
      title="Character Gameplay"
      description="A focused view of character growth curves, rarity mix, species, and level upgrade costs."
    >
      <CharacterProgressionPanel
        rows={dashboard.levelProgression}
        profiles={dashboard.profileProgression}
      />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <CharacterStatDiamond profiles={dashboard.statProfiles} />
        <LevelCostTable
          title="Character cost curve"
          costs={dashboard.levelCosts}
        />
      </div>
      <PerkReferencePanel perks={dashboard.perks} />
    </PageShell>
  );
}

export function WeaponGameplayDashboardPage({
  dashboard,
}: {
  dashboard: WeaponGameplayDashboard;
}) {
  return (
    <PageShell
      active="weapons"
      eyebrow="Game data"
      title="Weapon Gameplay"
      description="Weapon families, star bonuses, base stats, fuse costs, dismantle rewards, and level requirements."
    >
      <WeaponDamageByStar bonuses={dashboard.starBonuses} />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <WeaponStatDiamond rows={dashboard.baseStats} />
        <LevelCostTable
          title="Weapon cost curve"
          costs={dashboard.levelCosts}
        />
      </div>
      <WeaponBaseStats rows={dashboard.baseStats} />
    </PageShell>
  );
}

export function EconomyGameplayDashboardPage({
  dashboard,
}: {
  dashboard: EconomyGameplayDashboard;
}) {
  return (
    <PageShell
      active="economy"
      eyebrow="Game data"
      title="Upgrade economy"
      description="Costs and rewards for character upgrades, weapon fusing, and the resources they consume."
    >
      <CurrencyUsagePanel
        rows={dashboard.currencyUsage}
        costs={dashboard.upgradeCosts}
      />
      <EconomyCostTable rows={dashboard.upgradeCosts} />
    </PageShell>
  );
}
