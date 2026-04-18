// api/toggle-simulator.js
// This is the CONTROLLER for starting and stopping the simulator
// Its only job is to handle the request and send back the response
// All database logic for the settings table lives in src/models/settingsModel.js

import { getSetting, updateSetting } from "../src/models/settingsModel.js";

export default async function handler(req, res) {
  // Set CORS headers so the frontend can call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests from the browser
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    // Determine the new value based on the action sent from the frontend
    const { action } = req.body;
    const newValue = action === "start" ? "true" : "false";

    try {
      // Hand off to the model to update the database
      await updateSetting("simulator_running", newValue);
      return res.status(200).json({ isRunning: newValue === "true" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      // Hand off to the model to read from the database
      const value = await getSetting("simulator_running");
      return res.status(200).json({ isRunning: value === "true" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}