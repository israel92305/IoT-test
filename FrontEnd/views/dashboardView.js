// dashboardView.js
// This is the VIEW responsible for general UI updates on the dashboard
// Its only job is to update things like buttons, status indicators and notifications
// No fetch calls here — it just receives instructions and updates the DOM

/**
 * Updates the simulator toggle button text and colour
 * Shows "Pause Simulator" in red when running, "Start Simulator" in green when paused
 * @param {boolean} isRunning - Whether the simulator is currently running
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function updateSimulatorButton(isRunning) {
  const btn = document.getElementById("simulator-btn");

  // If the button doesn't exist in the HTML, skip
  if (!btn) return;

  // Update the button text based on current state
  btn.textContent = isRunning ? "⏸ Pause Simulator" : "▶ Start Simulator";

  // Swap the CSS classes to change the button colour
  btn.classList.toggle("btn-danger", isRunning);
  btn.classList.toggle("btn-success", !isRunning);
}

/**
 * Updates the live status indicator dot and label
 * Shows a green "Live" dot when running, grey "Paused" when stopped
 * @param {boolean} isRunning - Whether the simulator is currently running
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function updateStatusIndicator(isRunning) {
  const dot = document.getElementById("status-dot");
  const label = document.getElementById("status-label");

  if (dot) {
    dot.classList.toggle("status-live", isRunning);
    dot.classList.toggle("status-paused", !isRunning);
  }

  if (label) {
    label.textContent = isRunning ? "Live" : "Paused";
  }
}

/**
 * Shows a temporary toast notification at the bottom of the screen
 * Automatically disappears after 3 seconds
 * @param {string} message        - The message to display
 * @param {"success"|"error"} type - Controls the colour of the toast
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function showToast(message, type = "success") {
  // Create the toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add it to the page
  document.body.appendChild(toast);

  // Remove it after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}