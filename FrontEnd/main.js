// main.js
// This is the ENTRY POINT for the entire frontend
// Its only job is to boot the dashboard controller when the page loads
// All the real logic lives in dashboardController.js

import { initDashboard } from "./controllers/dashboardController.js";

// DOMContentLoaded may have already fired by the time the module loads
// so we check if the document is already ready before waiting for the event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  // DOM is already ready — call initDashboard immediately
  initDashboard();
}