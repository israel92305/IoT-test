// api/get-readings.js
// This is the CONTROLLER for fetching readings for the charts
// It calls the model to get raw data, then transforms it for the frontend
// The transformation (grouping by time) is presentation logic so it stays in the controller

import { fetchLatestReadings } from "../src/models/readingModel.js";

/**
 * Groups raw database rows into time-bucketed objects the charts can use
 * Example output: [{ time: "12:00:01", heart_rate: 72, blood_pressure: 120 }, ...]
 * Called by: handler()
 */
function groupReadingsForChart(rows) {
  const grouped = {};

  rows.forEach((row) => {
    // Convert the timestamp into a readable time string e.g. "12:00:01"
    const time = new Date(row.recorded_at).toLocaleTimeString();
    const deviceType = row.devices?.device_type;

    // Create a new time bucket if one doesn't exist yet
    if (!grouped[time]) {
      grouped[time] = { time };
    }

    // If this device type hasn't been seen at this time, just store the value
    // If it has been seen, average the two values together
    if (grouped[time][deviceType] === undefined) {
      grouped[time][deviceType] = row.value;
    } else {
      grouped[time][deviceType] = (grouped[time][deviceType] + row.value) / 2;
    }
  });

  // Reverse so oldest is first, then take only the last 20 time points
  return Object.values(grouped).reverse().slice(-20);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Step 1 — get raw rows from the model
    const rows = await fetchLatestReadings(100);

    // Step 2 — transform them into chart-friendly format
    const result = groupReadingsForChart(rows);

    res.status(200).json(result);
  } catch (err) {
    console.error("get-readings error:", err.message);
    res.status(500).json({ error: err.message });
  }
}