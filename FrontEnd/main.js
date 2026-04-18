// main.js
// This is the ENTRY POINT for the entire frontend
// Its only job is to boot the dashboard controller when the page loads
// All the real logic lives in dashboardController.js

import { initDashboard } from "./controllers/dashboardController.js";

// Wait for the DOM to be fully loaded before initialising the dashboard
document.addEventListener("DOMContentLoaded", initDashboard);