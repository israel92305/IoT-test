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

const STATUS_COLORS = {
    normal:   { border: "#1E3048", glow: "none",                          badge: null },
    warning:  { border: "#F0A500", glow: "0 0 12px rgba(240,165,0,0.3)",  badge: "#F0A500" },
    critical: { border: "#E05C6A", glow: "0 0 16px rgba(224,92,106,0.4)", badge: "#E05C6A" }
};

// ── Build HTML layout ─────────────────────────────────────────────

const container = document.getElementById("chart-container");
container.innerHTML = `
    <div class="dashboard-header">
        <span class="dashboard-title">Patient Vitals Monitor</span>
        <div class="header-right">
            <div class="sim-controls">
                <button class="sim-btn" id="analyzeBtn" onclick="runSentinel()">
                    <span class="btn-dot"></span> Analyze
                </button>
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
    <div id="sentinel-summary"></div>
    <div class="vitals-grid">
        ${Object.entries(VITALS_CONFIG).map(([key, cfg]) => `
            <div class="vital-card" style="--accent: ${cfg.color}" id="card-${key}">
                <div class="vital-label">${cfg.label}</div>
                <div class="vital-value" id="val-${key}">--</div>
                <div class="vital-unit">${cfg.unit}</div>
                <div class="sentinel-msg" id="sentinel-${key}"></div>
            </div>
        `).join("")}
    </div>
    <div class="chart-panel">
        <div class="chart-panel-title">Trend — last 20 readings</div>
        <canvas id="mainChart"></canvas>
    </div>
`;

// ── Critical alert overlay ────────────────────────────────────────

const overlay = document.createElement("div");
overlay.id = "critical-overlay";
overlay.innerHTML = `
    <div id="critical-modal">
        <div class="alert-header">
            <div class="alert-icon">!</div>
            <div>
                <div class="alert-title">Critical Alert — Immediate Attention Required</div>
                <div class="alert-subtitle">MedIntel Sentinel has detected a critical patient state</div>
            </div>
        </div>
        <div class="alert-summary" id="alert-summary"></div>
        <div class="alert-vitals" id="alert-vitals"></div>
        <div class="alert-recommendation" id="alert-recommendation"></div>
        <div class="alert-actions">
            <button class="btn-emergency" onclick="callEmergency()">🚨 Call Emergency</button>
            <button class="btn-dismiss" onclick="dismissAlert()">Dismiss</button>
        </div>
    </div>
`;
document.body.appendChild(overlay);

// ── Chart.js setup ────────────────────────────────────────────────

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
            line: { tension: 0.4, borderWidth: 1.5, spanGaps: true },
            point: { radius: 0, hoverRadius: 4 }
        }
    }
});

// ── Vitals fetch & chart update ───────────────────────────────────

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

    // Update vital cards with latest values
    keys.forEach(key => {
        const el = document.getElementById(`val-${key}`);
        if (el && latest[key] !== undefined) {
            el.textContent = typeof latest[key] === "number"
                ? latest[key].toFixed(1)
                : latest[key];
        }
    });

    // Update chart datasets
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

// ── Simulator controls ────────────────────────────────────────────

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

// ── Sentinel AI Analysis ──────────────────────────────────────────

function applySentinel(analysis) {
    // Update each vital card with status and message
    Object.entries(analysis.vitals).forEach(([key, result]) => {
        const card = document.getElementById(`card-${key}`);
        const msg = document.getElementById(`sentinel-${key}`);
        if (!card || !msg) return;

        const cfg = STATUS_COLORS[result.status] || STATUS_COLORS.normal;
        card.style.borderColor = cfg.border;
        card.style.boxShadow = cfg.glow;
        msg.textContent = result.message;
        msg.style.color = cfg.badge || "rgba(255,255,255,0.4)";
    });

    // Show critical popup once after all cards updated
    showCriticalAlert(analysis);

    // Update summary bar
    const bar = document.getElementById("sentinel-summary");
    const overall = analysis.overall_status;
    const barColors = {
        normal:   { bg: "rgba(72,201,169,0.08)",  border: "#48C9A9", color: "#48C9A9", icon: "✓" },
        warning:  { bg: "rgba(240,165,0,0.08)",   border: "#F0A500", color: "#F0A500", icon: "⚠" },
        critical: { bg: "rgba(224,92,106,0.1)",   border: "#E05C6A", color: "#E05C6A", icon: "!" }
    };
    const bc = barColors[overall] || barColors.normal;
    bar.style.display = "block";
    bar.style.background = bc.bg;
    bar.style.borderColor = bc.border;
    bar.style.color = bc.color;
    bar.innerHTML = `
        <strong>${bc.icon} ${overall.toUpperCase()}</strong> — ${analysis.summary}
        <div style="margin-top:6px; color: rgba(255,255,255,0.5); font-size:10px;">
            💊 ${analysis.recommendation}
        </div>
    `;
}

window.runSentinel = async function() {
    const btn = document.getElementById("analyzeBtn");
    btn.innerHTML = `<span class="btn-dot"></span> Analyzing...`;
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "none";

    try {
        const res = await fetch("https://medintel-iot-backend.vercel.app/api/sentinel");
        const analysis = await res.json();
        applySentinel(analysis);
    } catch (err) {
        console.error("Sentinel error:", err);
    } finally {
        btn.innerHTML = `<span class="btn-dot"></span> Analyze`;
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
    }
}

// Auto analyze every 30 seconds to avoid Gemini quota limits
setInterval(runSentinel, 30000);

// Run once on load after chart has time to populate
setTimeout(runSentinel, 4000);

// ── Critical Alert Popup ──────────────────────────────────────────

function showCriticalAlert(analysis) {
    // Only fire for critical status
    if (analysis.overall_status !== "critical") return;

    // Populate summary
    document.getElementById("alert-summary").textContent = analysis.summary;

    // Populate only critical vitals
    const vitalsContainer = document.getElementById("alert-vitals");
    vitalsContainer.innerHTML = "";
    Object.entries(analysis.vitals).forEach(([key, result]) => {
        if (result.status !== "critical") return;
        const label = VITALS_CONFIG[key]?.label || key;
        const row = document.createElement("div");
        row.className = "alert-vital-row";
        row.innerHTML = `<span class="vital-dot"></span><span><strong>${label}</strong> — ${result.message}</span>`;
        vitalsContainer.appendChild(row);
    });

    // Populate recommendation
    document.getElementById("alert-recommendation").textContent = `💊 ${analysis.recommendation}`;

    // Show overlay
    overlay.classList.add("active");
}

window.dismissAlert = function() {
    overlay.classList.remove("active");
}

window.callEmergency = function() {
    // Flash screen red to signal emergency
    document.body.style.transition = "background 0.2s";
    document.body.style.background = "rgba(224, 92, 106, 0.15)";
    setTimeout(() => {
        document.body.style.background = "#0B1623";
    }, 600);

    // In a real system this would trigger a call or pager
    alert("🚨 Emergency services have been notified. Please proceed with emergency protocol.");
    overlay.classList.remove("active");
}