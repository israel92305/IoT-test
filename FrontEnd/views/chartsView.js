// chartsView.js
// This is the VIEW responsible for all chart rendering
// Its only job is to initialise and update Chart.js charts
// No fetch calls here — it just receives data and draws it

// Keeps track of all active chart instances so we can update them later
let chartInstances = {};

/**
 * Initialises a single line chart on a canvas element
 * Creates the chart with empty data — updateChart() fills it later
 * @param {string} canvasId - The ID of the <canvas> element in index.html
 * @param {string} label    - The label shown in the chart legend
 * @param {string} color    - RGB values as a string e.g. "255, 99, 132"
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function initChart(canvasId, label, color) {
  const ctx = document.getElementById(canvasId)?.getContext("2d");

  // If the canvas element doesn't exist in the HTML, skip it
  if (!ctx) return null;

  // If a chart already exists on this canvas, destroy it first
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  // Create the Chart.js instance with our medical dashboard styling
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor: `rgb(${color})`,
          backgroundColor: `rgba(${color}, 0.1)`,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      // Disable animation so live updates feel instant
      animation: false,
      scales: {
        x: { ticks: { color: "#ccc" }, grid: { color: "#333" } },
        y: { ticks: { color: "#ccc" }, grid: { color: "#333" } },
      },
      plugins: {
        legend: { labels: { color: "#ccc" } },
      },
    },
  });

  // Store the instance so updateChart() can find it later
  chartInstances[canvasId] = chart;
  return chart;
}

/**
 * Updates an existing chart with fresh data from the API
 * @param {string} canvasId - Must match the ID used in initChart()
 * @param {Array}  readings - Array of grouped reading objects from the API
 * @param {string} dataKey  - The device type key to extract e.g. "heart_rate"
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function updateChart(canvasId, readings, dataKey) {
  const chart = chartInstances[canvasId];

  // If the chart hasn't been initialised yet, skip
  if (!chart) return;

  // Update the time labels on the x axis
  chart.data.labels = readings.map((r) => r.time);

  // Update the data points — null if a reading doesn't have this device type
  chart.data.datasets[0].data = readings.map((r) => r[dataKey] ?? null);

  // Tell Chart.js to re-render
  chart.update();
}