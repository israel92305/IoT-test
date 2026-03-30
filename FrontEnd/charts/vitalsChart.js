const VITALS_CONFIG = {
    heart_rate:        { label: "Heart Rate",        color: "#E05C6A", unit: "bpm",   min: 40,  max: 160 },
    blood_pressure:    { label: "Blood Pressure",    color: "#4A9FD4", unit: "mmHg",  min: 60,  max: 180 },
    oxygen_saturation: { label: "Oxygen Saturation", color: "#48C9A9", unit: "%",     min: 85,  max: 100 },
    temperature:       { label: "Temperature",       color: "#F0A500", unit: "°C",    min: 35,  max: 40  },
    glucose:           { label: "Glucose",           color: "#A78BFA", unit: "mg/dL", min: 50,  max: 200 }
};

const COLORS = {
    bg:         "#0B1623",
    panel:      "#111E2E",
    border:     "#1E3048",
    gridLine:   "rgba(255,255,255,0.04)",
    tickColor:  "rgba(255,255,255,0.35)",
    legendText: "#CBD5E1",
};

const style = document.createElement("style");
style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        background: ${COLORS.bg};
        margin: 0;
        padding: 24px;
        font-family: 'IBM Plex Sans', sans-serif;
        color: #CBD5E1;
        min-height: 100vh;
        box-sizing: border-box;
    }

    .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 1px solid ${COLORS.border};
    }

    .dashboard-title {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #4A9FD4;
        font-family: 'IBM Plex Mono', monospace;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .sim-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sim-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 5px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;
    }

    #startBtn {
        border: 1px solid #48C9A9;
        color: #48C9A9;
    }

    #startBtn:hover {
        background: #48C9A9;
        color: #0B1623;
    }

    #stopBtn {
        border: 1px solid #E05C6A;
        color: #E05C6A;
    }

    #stopBtn:hover {
        background: #E05C6A;
        color: #fff;
    }

    .btn-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }

    #sim-status {
        font-size: 10px;
        font-family: 'IBM Plex Mono', monospace;
        letter-spacing: 0.08em;
        padding-left: 10px;
        border-left: 1px solid rgba(255,255,255,0.1);
        transition: color 0.3s;
    }

    #sim-status.running { color: #48C9A9; }
    #sim-status.paused  { color: #E05C6A; }

    .live-badge {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
        font-family: 'IBM Plex Mono', monospace;
        color: #48C9A9;
        letter-spacing: 0.08em;
    }

    .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #48C9A9;
        animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.8); }
    }

    .vitals-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        margin-bottom: 24px;
    }

    .vital-card {
        background: ${COLORS.panel};
        border: 1px solid ${COLORS.border};
        border-radius: 10px;
        padding: 14px 16px;
        position: relative;
        overflow: hidden;
    }

    .vital-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: var(--accent);
    }

    .vital-label {
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.4);
        margin-bottom: 6px;
        font-family: 'IBM Plex Mono', monospace;
    }

    .vital-value {
        font-size: 26px;
        font-weight: 300;
        color: var(--accent);
        font-family: 'IBM Plex Mono', monospace;
        line-height: 1;
    }

    .vital-unit {
        font-size: 11px;
        color: rgba(255,255,255,0.3);
        margin-top: 4px;
        font-family: 'IBM Plex Mono', monospace;
    }

    .chart-panel {
        background: ${COLORS.panel};
        border: 1px solid ${COLORS.border};
        border-radius: 10px;
        padding: 20px;
    }

    .chart-panel-title {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.3);
        margin-bottom: 16px;
        font-family: 'IBM Plex Mono', monospace;
    }
`;
document.head.appendChild(style);

const container = document.getElementById("chart-container");
container.innerHTML = `
    <div class="dashboard-header">
        <span class="dashboard-title">Patient Vitals Monitor</span>
        <div class="header-right">
            <div class="sim-controls">
                <button class="sim-btn" id="startBtn" onclick="controlSimulator('start')">
                    <span class="btn-dot"></span> Start
                </button>
                <button class="sim-btn" id="stopBtn" onclick="controlSimulator('stop')">
                    <span class="btn-dot"></span> Stop
                </button>
                <span id="sim-status" class="running">Running</span>
            </div>
            <span class="live-badge"><span class="live-dot"></span>LIVE</span>
        </div>
    </div>
    <div class="vitals-grid">
        ${Object.entries(VITALS_CONFIG).map(([key, cfg]) => `
            <div class="vital-card" style="--accent: ${cfg.color}" id="card-${key}">
                <div class="vital-label">${cfg.label}</div>
                <div class="vital-value" id="val-${key}">--</div>
                <div class="vital-unit">${cfg.unit}</div>
            </div>
        `).join("")}
    </div>
    <div class="chart-panel">
        <div class="chart-panel-title">Trend — last 20 readings</div>
        <canvas id="mainChart"></canvas>
    </div>
`;

const mainCtx = document.getElementById("mainChart").getContext("2d");

const vitalsChart = new Chart(mainCtx, {
    type: "line",
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        animation: { duration: 600, easing: "easeInOutCubic" },
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: COLORS.legendText,
                    font: { family: "'IBM Plex Mono'", size: 11 },
                    boxWidth: 12,
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "line"
                }
            },
            tooltip: {
                backgroundColor: "#0B1623",
                borderColor: COLORS.border,
                borderWidth: 1,
                titleColor: "rgba(255,255,255,0.5)",
                bodyColor: "#CBD5E1",
                titleFont: { family: "'IBM Plex Mono'", size: 10 },
                bodyFont: { family: "'IBM Plex Mono'", size: 12 },
                padding: 12,
                callbacks: {
                    label: ctx => {
                        const key = Object.keys(VITALS_CONFIG)[ctx.datasetIndex];
                        const unit = VITALS_CONFIG[key]?.unit || "";
                        return ` ${ctx.dataset.label}: ${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(1) : "—"} ${unit}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: COLORS.tickColor,
                    font: { family: "'IBM Plex Mono'", size: 10 },
                    maxTicksLimit: 8,
                    maxRotation: 0
                },
                grid: { color: COLORS.gridLine },
                border: { color: COLORS.border }
            },
            y: {
                ticks: {
                    color: COLORS.tickColor,
                    font: { family: "'IBM Plex Mono'", size: 10 }
                },
                grid: { color: COLORS.gridLine },
                border: { color: COLORS.border }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 1.5,
                spanGaps: true
            },
            point: { radius: 0, hoverRadius: 4 }
        }
    }
});

window.controlSimulator = async function(action) {
    try {
        const res = await fetch("https://medintel-iot-backend.vercel.app/api/toggle-simulator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });
        const data = await res.json();
        const status = document.getElementById("sim-status");
        if (data.isRunning) {
            status.textContent = "Running";
            status.className = "running";
        } else {
            status.textContent = "Paused";
            status.className = "paused";
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

let vitalsHistory = [];

function updateChart(data) {
    if (!data || data.length === 0) return;

    const existingTimes = new Set(vitalsHistory.map(d => d.time));
    const newPoints = data.filter(d => !existingTimes.has(d.time));

    if (newPoints.length === 0) return;

    vitalsHistory.push(...newPoints);
    if (vitalsHistory.length > 20) vitalsHistory = vitalsHistory.slice(-20);

    const keys = Object.keys(VITALS_CONFIG);

    const latest = vitalsHistory[vitalsHistory.length - 1];
    keys.forEach(key => {
        const el = document.getElementById(`val-${key}`);
        if (el && latest[key] !== undefined) {
            el.textContent = typeof latest[key] === "number"
                ? latest[key].toFixed(1)
                : latest[key];
        }
    });

    vitalsChart.data.labels = vitalsHistory.map(d => d.time);
    vitalsChart.data.datasets = keys.map(key => ({
        label: VITALS_CONFIG[key].label,
        data: vitalsHistory.map(d => d[key] ?? null),
        borderColor: VITALS_CONFIG[key].color,
        backgroundColor: "transparent",
        borderWidth: 1.5,
        fill: false,
        spanGaps: true
    }));

    vitalsChart.update("active");
}

async function fetchVitals() {
    try {
        const response = await fetch("https://medintel-iot-backend.vercel.app/api/get-readings");
        const data = await response.json();
        updateChart(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

setInterval(fetchVitals, 3000);
fetchVitals();