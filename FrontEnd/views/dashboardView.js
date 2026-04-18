// dashboardView.js
// Handles general UI updates — status indicator and toast notifications

/**
 * Updates the sim status text to reflect running or paused state
 * @param {boolean} isRunning
 */
export function updateSimulatorStatus(isRunning) {
  const status = document.getElementById("sim-status");
  if (status) {
    status.textContent = isRunning ? "RUNNING" : "PAUSED";
    status.className = isRunning ? "running" : "paused";
  }
}

/**
 * Shows a temporary toast notification
 * @param {string} message
 * @param {"success"|"error"} type
 */
export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}