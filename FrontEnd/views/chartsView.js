// chartsView.js
// Owns all Chart.js rendering
// Single chart with multiple vital lines

const VITALS_CONFIG = {
    heart_rate:        { label: "Heart Rate",        color: "#E05C6A", unit: "bpm"   },
    blood_pressure:    { label: "Blood Pressure",    color: "#4A9FD4", unit: "mmHg"  },
    oxygen_saturation: { label: "Oxygen Saturation", color: "#48C9A9", unit: "%"     },
    temperature:       { label: "Temperature",       color: "#F0A500", unit: "°C"    },
    glucose:           { label: "Glucose",           color: "#A78BFA", unit: "mg/dL" },
};

const COLORS = {
    bg:         "#0B1623",
    panel:      "#111E2E",
    border:     "#1E3048",
    gridLine:   "rgba(255,255,255,0.04)",
    tickColor:  "rgba(255,255,255,0.35)",
    legendText: "#CBD5E1",
};

// Holds the single Chart.js instance
let chartInstance = null;

/**
 * Initialises the single multi-line vitals chart
 * One dataset per vital sign, all on the same canvas
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function initChart() {
    const ctx = document.getElementById("vitalsChart")?.getContext("2d");
    if (!ctx) return null;

    if (chartInstance) chartInstance.destroy();

    // Build one dataset per vital type
    const datasets = Object.entries(VITALS_CONFIG).map(([key, cfg]) => ({
        label:            cfg.label,
        data:             [],
        borderColor:      cfg.color,
        backgroundColor:  cfg.color + "18",
        borderWidth:      1.5,
        pointRadius:      2,
        pointHoverRadius: 5,
        tension:          0.4,
        fill:             false,
        // spanGaps fills in the line across missing data points
        // so lines don't break when a timestamp is missing a vital
        spanGaps:         true,
    }));

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels: [], datasets },
        options: {
            responsive: true,
            animation:  false,
            interaction: {
                // Show all vitals tooltip at the same time point
                mode:      "index",
                intersect: false,
            },
            scales: {
                x: {
                    ticks: { color: COLORS.tickColor, font: { family: "IBM Plex Mono", size: 10 } },
                    grid:  { color: COLORS.gridLine },
                },
                y: {
                    ticks: { color: COLORS.tickColor, font: { family: "IBM Plex Mono", size: 10 } },
                    grid:  { color: COLORS.gridLine },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color:    COLORS.legendText,
                        font:     { family: "IBM Plex Mono", size: 10 },
                        boxWidth: 12,
                    },
                },
                tooltip: {
                    backgroundColor: COLORS.panel,
                    borderColor:     COLORS.border,
                    borderWidth:     1,
                    titleColor:      COLORS.legendText,
                    bodyColor:       COLORS.tickColor,
                    titleFont:       { family: "IBM Plex Mono", size: 11 },
                    bodyFont:        { family: "IBM Plex Mono", size: 10 },
                    callbacks: {
                        label(ctx) {
                            const key  = Object.keys(VITALS_CONFIG)[ctx.datasetIndex];
                            const unit = VITALS_CONFIG[key]?.unit || "";
                            const val  = ctx.parsed.y;
                            // Show -- if value is missing at this time point
                            return ` ${ctx.dataset.label}: ${val !== null ? val + " " + unit : "--"}`;
                        }
                    }
                }
            }
        }
    });

    return chartInstance;
}

/**
 * Updates the chart with fresh readings from the API
 * API keys match VITALS_CONFIG keys directly
 * @param {Array} readings - Array of grouped reading objects from the API
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function updateChart(readings) {
    if (!chartInstance) return;

    // Set the time labels on the x axis
    chartInstance.data.labels = readings.map(r => r.time);

    // Update each dataset — null for missing values (spanGaps handles the line)
    Object.keys(VITALS_CONFIG).forEach((vitalKey, index) => {
        chartInstance.data.datasets[index].data = readings.map(r =>
            r[vitalKey] !== undefined ? r[vitalKey] : null
        );
    });

    chartInstance.update();
}