// apiModel.js
// This is the MODEL for the frontend
// Its only job is to talk to the backend API
// No DOM manipulation here — just fetch calls in and data out
// If the API URL ever changes, this is the ONLY file you need to update

const BASE_URL = "https://medintel-iot-backend.vercel.app/api";

/**
 * Fetches the latest grouped readings for the charts
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export async function getReadings() {
  const res = await fetch(`${BASE_URL}/get-readings`);
  if (!res.ok) throw new Error("Failed to fetch readings");
  return res.json();
}

/**
 * Fetches the Sentinel AI analysis of the current vitals
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export async function getSentinelAnalysis() {
  const res = await fetch(`${BASE_URL}/sentinel`);
  if (!res.ok) throw new Error("Failed to fetch Sentinel analysis");
  return res.json();
}

/**
 * Checks whether the simulator is currently running or paused
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export async function getSimulatorStatus() {
  const res = await fetch(`${BASE_URL}/toggle-simulator`);
  if (!res.ok) throw new Error("Failed to get simulator status");
  const data = await res.json();
  return data.isRunning;
}

/**
 * Starts or stops the simulator by sending an action to the API
 * @param {"start"|"stop"} action
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export async function toggleSimulator(action) {
  const res = await fetch(`${BASE_URL}/toggle-simulator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to toggle simulator");
  const data = await res.json();
  return data.isRunning;
}