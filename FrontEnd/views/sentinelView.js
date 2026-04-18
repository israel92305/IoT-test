// sentinelView.js
// This is the VIEW responsible for rendering the Sentinel AI results
// Its only job is to take data and display it in the DOM
// No fetch calls here — it just receives the analysis and renders it

// Maps status values to colours for visual feedback
const STATUS_COLORS = {
  normal: "#00c896",   // green
  warning: "#f5a623",  // orange
  critical: "#e74c3c", // red
};

/**
 * Shows a loading message while Sentinel is analysing
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function showSentinelLoading() {
  const panel = document.getElementById("sentinel-panel");
  if (panel) panel.innerHTML = `<p class="sentinel-loading">Sentinel analysing vitals...</p>`;
}

/**
 * Renders the full Sentinel analysis result into the sentinel panel
 * @param {Object} analysis - The object returned from /api/sentinel
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function renderSentinelAnalysis(analysis) {
  const panel = document.getElementById("sentinel-panel");

  // If the panel doesn't exist in the HTML, skip
  if (!panel) return;

  // Get the colour for the overall status
  const color = STATUS_COLORS[analysis.overall_status] || "#ccc";

  // Build the HTML for each individual vital's status
  const vitalsHTML = Object.entries(analysis.vitals)
    .map(([key, v]) => {
      const vColor = STATUS_COLORS[v.status] || "#ccc";
      return `
        <div class="sentinel-vital">
          <span class="vital-name">${key.replace(/_/g, " ")}</span>
          <span class="vital-status" style="color:${vColor}">${v.status.toUpperCase()}</span>
          <span class="vital-msg">${v.message}</span>
        </div>
      `;
    })
    .join("");

  // Inject the full analysis into the panel
  panel.innerHTML = `
    <div class="sentinel-header" style="border-left: 4px solid ${color}">
      <h3>Overall: <span style="color:${color}">${analysis.overall_status.toUpperCase()}</span></h3>
      <p>${analysis.summary}</p>
    </div>
    <div class="sentinel-vitals">${vitalsHTML}</div>
    <div class="sentinel-recommendation">
      <strong>Recommendation:</strong> ${analysis.recommendation}
    </div>
  `;
}

/**
 * Shows an error message in the Sentinel panel if something goes wrong
 * @param {string} message - The error message to display
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function renderSentinelError(message) {
  const panel = document.getElementById("sentinel-panel");
  if (panel) panel.innerHTML = `<p class="sentinel-error">Sentinel error: ${message}</p>`;
}