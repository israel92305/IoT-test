// api/add-reading.js
// This is the CONTROLLER for adding a reading
// Its only job is to validate the request, call the model, and send the response
// All database logic lives in src/models/readingModel.js

import { insertReading } from "../src/models/readingModel.js";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Pull device_id and value out of the request body
  const { device_id, value } = req.body;

  // Validate that both fields were actually sent
  if (!device_id || value === undefined) {
    return res.status(400).json({ error: "device_id and value are required" });
  }

  try {
    // Hand off to the model — controller doesn't care HOW it's saved
    const data = await insertReading(device_id, value);
    res.status(200).json({ message: "Reading added", data });
  } catch (err) {
    console.error("add-reading error:", err.message);
    res.status(500).json({ error: err.message });
  }
}