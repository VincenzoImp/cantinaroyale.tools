"use client";

import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip } from "chart.js";
import { useTheme } from "@/contexts/ThemeContext";
import { chartColors } from "@/utils/theme";
import { WeaponData, ChartData, ChartOptions } from "@/types";
import { useState, useEffect } from "react";

// Register Chart.js components
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip);

interface RadarChartProps {
    weapons?: Record<string, WeaponData>;
    title?: string;
}

export default function RadarChart({
    weapons = {},
    title = "Weapon Comparison"
}: RadarChartProps) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle SSR case - don't render until mounted
    if (!mounted) {
        return (
            <div className="w-full h-96 bg-theme-surface rounded-lg border border-theme-border p-4">
                <h3 className="text-lg font-semibold text-theme-text mb-4 text-center">
                    {title}
                </h3>
                <div className="flex items-center justify-center h-64">
                    <div className="text-theme-muted">Loading chart...</div>
                </div>
            </div>
        );
    }

    const colors = chartColors[theme] || chartColors.light;

    // Handle SSR case where theme might not be available
    if (!theme) {
        return (
            <div className="w-full h-96 bg-theme-surface rounded-lg border border-theme-border p-4">
                <h3 className="text-lg font-semibold text-theme-text mb-4 text-center">
                    {title}
                </h3>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-theme-muted">Loading chart...</p>
                </div>
            </div>
        );
    }

    // Default weapons data if none provided
    const defaultWeapons: Record<string, WeaponData> = {
        "Deagle": {
            damage: 2200.0,
            cooldownAfterLastBullet: 0.65,
            reloadTime: 2.1,
            ammo: 3,
            projectile_speed: 14.0,
            projectile_range: 9.0,
            projectile_spawn_delay_after_shot: 0.1
        },
        "AK-47": {
            damage: 1800.0,
            cooldownAfterLastBullet: 0.1,
            reloadTime: 2.5,
            ammo: 30,
            projectile_speed: 12.0,
            projectile_range: 8.0,
            projectile_spawn_delay_after_shot: 0.05
        }
    };

    const weaponsData = Object.keys(weapons).length > 0 ? weapons : defaultWeapons;
    const weaponNames = Object.keys(weaponsData);
    const attributes = [
        'damage',
        'cooldownAfterLastBullet',
        'reloadTime',
        'ammo',
        'projectile_speed',
        'projectile_range',
        'projectile_spawn_delay_after_shot'
    ];

    // Normalize data for better visualization
    const normalizeData = (value: number, attribute: string): number => {
        const maxValues: Record<string, number> = {
            damage: 3000,
            cooldownAfterLastBullet: 2,
            reloadTime: 5,
            ammo: 50,
            projectile_speed: 20,
            projectile_range: 15,
            projectile_spawn_delay_after_shot: 1
        };
        return Math.min(value / maxValues[attribute], 1);
    };

    const data: ChartData = {
        labels: attributes.map(attr =>
            attr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        ),
        datasets: weaponNames.map((weaponName, index) => ({
            label: weaponName,
            fill: true,
            data: attributes.map(attribute =>
                normalizeData(weaponsData[weaponName][attribute as keyof WeaponData], attribute)
            ),
            backgroundColor: `${colors.primary}20`,
            borderColor: colors.primary,
            borderWidth: 2,
            pointBackgroundColor: colors.primary,
            pointBorderColor: colors.background,
            pointBorderWidth: 2,
        })),
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 1,
                angleLines: {
                    color: colors.grid,
                    lineWidth: 1,
                },
                grid: {
                    color: colors.grid,
                    lineWidth: 1,
                },
                pointLabels: {
                    color: colors.text,
                    font: {
                        size: 12,
                        weight: '500' as const,
                    },
                },
                ticks: {
                    backdropColor: colors.background,
                    color: colors.text,
                    font: {
                        size: 10,
                    },
                    stepSize: 0.2,
                },
            }
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: colors.text,
                    font: {
                        size: 12,
                        weight: '500' as const,
                    },
                }
            },
            tooltip: {
                backgroundColor: colors.background,
                titleColor: colors.text,
                bodyColor: colors.text,
                borderColor: colors.primary,
                borderWidth: 1,
            }
        },
        elements: {
            line: {
                borderWidth: 2,
                tension: 0.1,
            },
            point: {
                radius: 4,
                hoverRadius: 6,
            }
        },
        interaction: {
            intersect: false,
        }
    };

    if (weaponNames.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-theme-surface rounded-lg border border-theme-border">
                <p className="text-theme-muted">No weapon data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-96 bg-theme-surface rounded-lg border border-theme-border p-4">
            <h3 className="text-lg font-semibold text-theme-text mb-4 text-center">
                {title}
            </h3>
            <div className="h-80">
                <Radar data={data} options={options} />
            </div>
        </div>
    );
}
