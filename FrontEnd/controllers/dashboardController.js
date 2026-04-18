// dashboardController.js
// This is the CONTROLLER for the entire frontend dashboard
// It is the brain — it calls the model to get data and tells the views what to render
// No fetch calls here, no DOM manipulation here — just coordination

import { getReadings, getSentinelAnalysis, getSimulatorStatus, toggleSimulator } from "../models/apiModel.js";
import { initChart, updateChart } from "../views/chartsView.js";
import { showSentinelLoading, renderSentinelAnalysis, renderSentinelError } from "../views/sentinelView.js";
import { updateSimulatorButton, updateStatusIndicator, showToast } from "../views/dashboardView.js";

// Chart configuration — one entry per vital sign
// Each entry maps a canvas ID to its label, colour and API data key
const CHART_CONFIG = [
  { id: "heartRateChart",     label: "Heart Rate (bpm)",      color: "255, 99, 132",  key: "heart_rate" },
  { id: "bloodPressureChart", label: "Blood Pressure (mmHg)", color: "54, 162, 235",  key: "blood_pressure" },
  { id: "temperatureChart",   label: "Temperature (°C)",      color: "255, 206, 86",  key: "temperature_sensor" },
  { id: "oxygenChart",        label: "Oxygen Saturation (%)", color: "75, 192, 192",  key: "oxygen_sensor" },
  { id: "glucoseChart",       label: "Glucose (mg/dL)",       color: "153, 102, 255", key: "glucose_monitor" },
];

// Stores the polling interval so we can stop it if needed
let pollingInterval = null;

/**
 * Initialises the entire dashboard
 * 1. Sets up all charts
 * 2. Loads the simulator status
 * 3. Binds button click events
 * 4. Starts the live data polling loop
 * Called by: FrontEnd/main.js
 */
export async function initDashboard() {
  // Initialise all chart canvases with empty data
  CHART_CONFIG.forEach(({ id, label, color }) => initChart(id, label, color));

  // Load the current simulator status and update the button accordingly
  try {
    const isRunning = await getSimulatorStatus();
    updateSimulatorButton(isRunning);
    updateStatusIndicator(isRunning);
  } catch {
    showToast("Could not reach simulator status", "error");
  }

  // Bind the simulator toggle button click event
  const simulatorBtn = document.getElementById("simulator-btn");
  if (simulatorBtn) simulatorBtn.addEventListener("click", handleSimulatorToggle);

  // Bind the Sentinel refresh button click event
  const sentinelBtn = document.getElementById("sentinel-btn");
  if (sentinelBtn) sentinelBtn.addEventListener("click", handleSentinelRefresh);

  // Do an immediate chart refresh then start polling every 5 seconds
  await refreshCharts();
  pollingInterval = setInterval(refreshCharts, 5000);
}

/**
 * Fetches the latest readings and updates all charts
 * Runs immediately on load then every 5 seconds via the polling interval
 * Called by: initDashboard() and setInterval()
 */
async function refreshCharts() {
  try {
    // Get fresh data from the model
    const readings = await getReadings();

    // Pass the data to each chart in the view
    CHART_CONFIG.forEach(({ id, key }) => updateChart(id, readings, key));
  } catch (err) {
    console.error("Chart refresh failed:", err.message);
  }
}

/**
 * Handles the simulator start/stop button being clicked
 * Figures out the current state, sends the opposite action, updates the UI
 * Called by: the simulator button click event in initDashboard()
 */
async function handleSimulatorToggle() {
  const btn = document.getElementById("simulator-btn");

  // Check the current state by looking at which CSS class the button has
  const currentlyRunning = btn?.classList.contains("btn-danger");
  const action = currentlyRunning ? "stop" : "start";

  try {
    // Tell the model to toggle the simulator
    const isRunning = await toggleSimulator(action);

    // Update the UI to reflect the new state
    updateSimulatorButton(isRunning);
    updateStatusIndicator(isRunning);
    showToast(`Simulator ${isRunning ? "started" : "paused"}`);
  } catch (err) {
    showToast("Failed to toggle simulator", "error");
    console.error(err.message);
  }
}

/**
 * Handles the Sentinel AI analysis button being clicked
 * Shows a loading state then fetches and renders the analysis
 * Called by: the sentinel button click event in initDashboard()
 */
async function handleSentinelRefresh() {
  // Tell the view to show a loading message immediately
  showSentinelLoading();

  try {
    // Get the analysis from the model
    const analysis = await getSentinelAnalysis();

    // Pass it to the view to render
    renderSentinelAnalysis(analysis);
  } catch (err) {
    renderSentinelError(err.message);
  }
}

/**
 * Stops the polling loop
 * Call this if the user navigates away from the dashboard
 * Called by: FrontEnd/main.js (on page unload if needed)
 */
export function stopDashboard() {
  if (pollingInterval) clearInterval(pollingInterval);
}