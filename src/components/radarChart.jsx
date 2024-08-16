"use client";

import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip } from "chart.js";

export default function RadarPlot() {
    Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip);

    const weapons = {
        "Deagle": {
            damage: 2200.0,
            cooldownAfterLastBullet: 0.65,
            reloadTime: 2.1,
            ammo: 3,
            projectile_speed: 14.0,
            projectile_range: 9.0,
            projectile_spawn_delay_after_shot: 0.1
        }
        // Puoi aggiungere altre armi qui
    };

    const labels = Object.keys(weapons);
    const attributes = ['damage', 'cooldownAfterLastBullet', 'reloadTime', 'ammo', 'projectile_speed', 'projectile_range', 'projectile_spawn_delay_after_shot'];

    const data = {
        labels: attributes,
        datasets: labels.map((weaponName, index) => ({
            label: weaponName,
            fill: true,
            data: attributes.map(attribute => weapons[weaponName][attribute]),
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Sfondo delle aree riempite
            borderColor: 'rgba(0, 0, 0, 1)', // Colore dei bordi delle linee
            borderWidth: 1,
        })),
    };

    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(0, 0, 0, 1)', // Colore delle linee degli assi
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.2)', // Colore delle linee della griglia
                },
                pointLabels: {
                    color: 'rgba(0, 0, 0, 1)', // Colore delle etichette degli assi
                },
                ticks: {
                    backdropColor: 'rgba(255, 255, 255, 1)', // Colore di sfondo per i ticks
                    color: 'rgba(0, 0, 0, 1)', // Colore dei ticks
                },
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(0, 0, 0, 1)' // Colore delle etichette della legenda
                }
            }
        },
        elements: {
            line: {
                borderWidth: 3
            }
        }
    };

    return <Radar data={data} options={options} />;
}
