// sentinelView.js
// Renders Sentinel AI results using the original HTML element IDs and CSS classes

const STATUS_COLORS = {
  normal:   "#48C9A9",  // green
  warning:  "#F0A500",  // orange
  critical: "#E05C6A",  // red
};

/**
 * Shows a loading message while Sentinel is analysing
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function showSentinelLoading() {
  const summary = document.getElementById("sentinel-summary");
  if (summary) {
    summary.style.display = "block";
    summary.style.color = "#CBD5E1";
    summary.style.borderColor = "#1E3048";
    summary.textContent = "Sentinel analysing vitals...";
  }

  // Clear all individual vital card messages
  const keys = ["heart_rate", "blood_pressure", "oxygen_saturation", "temperature", "glucose"];
  keys.forEach(key => {
    const el = document.getElementById(`msg-${key}`);
    if (el) el.textContent = "analysing...";
  });
}

/**
 * Renders the full Sentinel analysis result
 * Uses the original sentinel-summary bar and vital card msg elements
 * @param {Object} analysis - The object returned from /api/sentinel
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function renderSentinelAnalysis(analysis) {
  const color = STATUS_COLORS[analysis.overall_status] || "#CBD5E1";

  // Update the sentinel summary bar at the top
  const summary = document.getElementById("sentinel-summary");
  if (summary) {
    summary.style.display = "block";
    summary.style.color = color;
    summary.style.borderColor = color;
    summary.textContent = `${analysis.overall_status.toUpperCase()} — ${analysis.summary} | ${analysis.recommendation}`;
  }

  // Update each vital card's sentinel message
  // Maps Gemini response keys to the HTML msg element IDs
  const keyMap = {
    heart_rate:        "msg-heart_rate",
    blood_pressure:    "msg-blood_pressure",
    oxygen_saturation: "msg-oxygen_saturation",
    temperature:       "msg-temperature",
    glucose:           "msg-glucose",
  };

  Object.entries(analysis.vitals).forEach(([key, v]) => {
    const elId = keyMap[key];
    const el = document.getElementById(elId);
    if (el) {
      el.textContent = v.message;
      el.style.color = STATUS_COLORS[v.status] || "rgba(255,255,255,0.4)";
    }
  });

  // Update each vital card border colour based on status
  const cardKeyMap = {
    heart_rate:        "val-heart_rate",
    blood_pressure:    "val-blood_pressure",
    oxygen_saturation: "val-oxygen_sensor",
    temperature:       "val-temperature_sensor",
    glucose:           "val-glucose_monitor",
  };

  Object.entries(analysis.vitals).forEach(([key, v]) => {
    const valEl = document.getElementById(cardKeyMap[key]);
    if (valEl) {
      const card = valEl.closest(".vital-card");
      if (card) {
        const statusColor = STATUS_COLORS[v.status];
        if (statusColor) {
          card.style.borderColor = statusColor;
          card.style.boxShadow = v.status === "critical"
            ? `0 0 16px rgba(224,92,106,0.4)`
            : v.status === "warning"
            ? `0 0 12px rgba(240,165,0,0.3)`
            : "none";
        }
      }
    }
  });
}

/**
 * Shows an error message in the sentinel summary bar
 * @param {string} message
 * Called by: FrontEnd/controllers/dashboardController.js
 */
export function renderSentinelError(message) {
  const summary = document.getElementById("sentinel-summary");
  if (summary) {
    summary.style.display = "block";
    summary.style.color = "#E05C6A";
    summary.style.borderColor = "#E05C6A";
    summary.textContent = `Sentinel error: ${message}`;
  }
}