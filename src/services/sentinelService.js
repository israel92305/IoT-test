// sentinelService.js
// This file contains ALL the Gemini AI logic for the Sentinel module
// It fetches vitals, builds the prompt, calls Gemini, and returns the analysis
// The api/sentinel.js controller just calls runSentinelAnalysis() and sends the result

import { fetchLatestReadings } from "../models/readingModel.js";

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;/**
 * Groups raw reading rows into the latest value per device type
 * Example output: { heart_rate: 72, blood_pressure: 120, ... }
 * Called by: runSentinelAnalysis()
 */
function groupLatestVitals(rows) {
  const latestVitals = {};

  rows.forEach((row) => {
    const type = row.devices?.device_type;
    // Only store the first (latest) value we see for each device type
    if (type && latestVitals[type] === undefined) {
      latestVitals[type] = row.value;
    }
  });

  return latestVitals;
}

/**
 * Builds the prompt string we send to Gemini
 * Slots in the actual vital values so Gemini can analyse them
 * Called by: runSentinelAnalysis()
 */
function buildPrompt(vitals) {
  return `
You are Sentinel, an AI medical monitoring assistant.
Analyze the following patient vitals and respond in JSON only.

Patient vitals:
- Heart Rate: ${vitals.heart_rate ?? "N/A"} bpm
- Blood Pressure: ${vitals.blood_pressure ?? "N/A"} mmHg
- Oxygen Saturation: ${vitals.oxygen_saturation ?? "N/A"} %
- Temperature: ${vitals.temperature ?? "N/A"} °C
- Glucose: ${vitals.glucose ?? "N/A"} mg/dL

Respond with this exact JSON structure and nothing else:
{
  "overall_status": "normal" | "warning" | "critical",
  "summary": "one sentence summary of patient status",
  "vitals": {
    "heart_rate":        { "status": "normal" | "warning" | "critical", "message": "brief explanation" },
    "blood_pressure":    { "status": "normal" | "warning" | "critical", "message": "brief explanation" },
    "oxygen_saturation": { "status": "normal" | "warning" | "critical", "message": "brief explanation" },
    "temperature":       { "status": "normal" | "warning" | "critical", "message": "brief explanation" },
    "glucose":           { "status": "normal" | "warning" | "critical", "message": "brief explanation" }
  },
  "recommendation": "what the doctor should do"
}
  `;
}

/**
 * Sends the prompt to Gemini and returns the parsed JSON analysis
 * Strips any markdown formatting Gemini might wrap around the JSON
 * Called by: runSentinelAnalysis()
 */
async function callGemini(prompt) {
  const geminiRes = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const geminiData = await geminiRes.json();

  // If Gemini returned an error status, throw it
  if (!geminiRes.ok) throw new Error(JSON.stringify(geminiData));

  // Extract the text from Gemini's response structure
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip any ```json ``` formatting Gemini sometimes adds
  const clean = rawText.replace(/```json|```/g, "").trim();

  return JSON.parse(clean);
}

/**
 * Main exported function — runs the full Sentinel analysis pipeline
 * 1. Fetches latest readings from the database
 * 2. Groups them into latest value per vital type
 * 3. Builds the Gemini prompt
 * 4. Calls Gemini and returns the parsed analysis
 * Called by: api/sentinel.js
 */
export async function runSentinelAnalysis() {
  const rows = await fetchLatestReadings(50);
  const vitals = groupLatestVitals(rows);
  const prompt = buildPrompt(vitals);
  const analysis = await callGemini(prompt);
  return analysis;
}