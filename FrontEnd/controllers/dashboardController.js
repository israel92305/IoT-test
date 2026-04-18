// dashboardController.js
// This is the CONTROLLER for the entire frontend dashboard
// It is the brain — it calls the model to get data and tells the views what to render
// No fetch calls here, no DOM manipulation here — just coordination

import {
  getReadings,
  getSentinelAnalysis,
  getSimulatorStatus,
  toggleSimulator,
} from "../models/apiModel.js";
import { initChart, updateChart } from "../views/chartsView.js";
import {
  showSentinelLoading,
  renderSentinelAnalysis,
  renderSentinelError,
} from "../views/sentinelView.js";
import { updateSimulatorStatus, showToast } from "../views/dashboardView.js";

// Stores the polling interval so we can stop it if needed
let pollingInterval = null;

/**
 * Initialises the entire dashboard
 * 1. Sets up the single multi-line chart
 * 2. Loads the simulator status
 * 3. Binds all button click events
 * 4. Starts the live data polling loop
 * Called by: FrontEnd/main.js
 */
export async function initDashboard() {
  // Initialise the single multi-line vitals chart
  initChart();

  // Load the current simulator status and update the UI accordingly
  try {
    const isRunning = await getSimulatorStatus();
    updateSimulatorStatus(isRunning);
  } catch {
    showToast("Could not reach simulator status", "error");
  }

  // Bind the Start button
  const startBtn = document.getElementById("startBtn");
  if (startBtn)
    startBtn.addEventListener("click", () => handleSimulatorToggle("start"));

  // Bind the Stop button
  const stopBtn = document.getElementById("stopBtn");
  if (stopBtn)
    stopBtn.addEventListener("click", () => handleSimulatorToggle("stop"));

  // Bind the Analyse button
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) analyzeBtn.addEventListener("click", handleSentinelRefresh);

  // Bind the dismiss button on the critical alert popup
  const dismissBtn = document.getElementById("dismissAlert");
  if (dismissBtn)
    dismissBtn.addEventListener("click", () => {
      document.getElementById("critical-overlay").classList.remove("active");
    });

  // Do an immediate chart refresh then poll every 5 seconds
  await refreshCharts();
  pollingInterval = setInterval(refreshCharts, 5000);
}

/**
 * Fetches the latest readings, updates the chart and the vital cards
 * Called by: initDashboard() and setInterval()
 */
async function refreshCharts() {
  try {
    const readings = await getReadings();

    // Update the single multi-line chart with all vitals
    updateChart(readings);

    // Update the vital value cards with the latest reading
    if (readings.length > 0) {
      const latest = readings[readings.length - 1];
      updateVitalCard("val-heart_rate", latest.heart_rate);
      updateVitalCard("val-blood_pressure", latest.blood_pressure);
      updateVitalCard("val-temperature_sensor", latest.temperature);
      updateVitalCard("val-oxygen_sensor", latest.oxygen_saturation);
      updateVitalCard("val-glucose_monitor", latest.glucose);
    }
  } catch (err) {
    console.error("Chart refresh failed:", err.message);
  }
}

/**
 * Updates a single vital card value in the DOM
 * @param {string} elementId - The id of the element to update
 * @param {number} value     - The value to display
 * Called by: refreshCharts()
 */
function updateVitalCard(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = value !== undefined ? value : "--";
}

/**
 * Handles the simulator start/stop buttons being clicked
 * @param {"start"|"stop"} action
 * Called by: startBtn and stopBtn click events
 */
async function handleSimulatorToggle(action) {
  try {
    // Tell the model to toggle the simulator
    const isRunning = await toggleSimulator(action);

    // Update the status indicator in the view
    updateSimulatorStatus(isRunning);
    showToast(`Simulator ${isRunning ? "started" : "paused"}`);
  } catch (err) {
    showToast("Failed to toggle simulator", "error");
    console.error(err.message);
  }
}

/**
 * Handles the Sentinel analyse button being clicked
 * Shows loading state, fetches analysis, renders results
 * Called by: analyzeBtn click event
 */
async function handleSentinelRefresh() {
  // Tell the view to show a loading message immediately
  showSentinelLoading();

  try {
    // Get the analysis from the model
    const analysis = await getSentinelAnalysis();

    // Pass it to the view to render
    renderSentinelAnalysis(analysis);

    // If the status is critical, show the alert popup
    if (analysis.overall_status === "critical") {
      showCriticalAlert(analysis);
    }
  } catch (err) {
    renderSentinelError(err.message);
  }
}

/**
 * Shows the critical alert popup with the analysis data
 * @param {Object} analysis - The Sentinel analysis object
 * Called by: handleSentinelRefresh()
 */
function showCriticalAlert(analysis) {
  document.getElementById("alert-summary").textContent = analysis.summary;
  document.getElementById("alert-recommendation").textContent =
    analysis.recommendation;

  // Build the list of critical vitals only
  const vitalsEl = document.getElementById("alert-vitals");
  vitalsEl.innerHTML = Object.entries(analysis.vitals)
    .filter(([, v]) => v.status === "critical")
    .map(
      ([key, v]) => `
      <div class="alert-vital-row">
        <div class="vital-dot"></div>
        ${key.replace(/_/g, " ")}: ${v.message}
      </div>
    `,
    )
    .join("");

  // Show the overlay
  document.getElementById("critical-overlay").classList.add("active");
}

/**
 * Stops the polling loop
 * Call this if the user navigates away from the dashboard
 * Called by: FrontEnd/main.js on page unload if needed
 */
export function stopDashboard() {
  if (pollingInterval) clearInterval(pollingInterval);
}
