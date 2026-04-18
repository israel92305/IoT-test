// api/sentinel.js
// This is the CONTROLLER for the Sentinel AI module
// Its only job is to handle the request and send back the response
// ALL the Gemini logic, prompt building, and data fetching lives in sentinelService.js

import { runSentinelAnalysis } from "../src/services/sentinelService.js";

export default async function handler(req, res) {
  // Set CORS headers so the frontend can call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests from the browser
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Hand everything off to the service — controller doesn't care about the details
    const analysis = await runSentinelAnalysis();
    res.status(200).json(analysis);
  } catch (err) {
    console.error("Sentinel error:", err.message);
    res.status(500).json({ error: "Sentinel analysis failed", details: err.message });
  }
}