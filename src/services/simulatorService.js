// simulatorService.js
// This file contains ALL the simulator logic
// It knows about devices, how to generate values, and how to send them
// The simulator.js entry point just calls this — it doesn't care about the details

import axios from "axios";

// The API endpoints the simulator talks to
const ADD_READING_URL = "https://medintel-iot-backend.vercel.app/api/add-reading";
const STATUS_URL = "https://medintel-iot-backend.vercel.app/api/toggle-simulator";

// All the clinic devices being simulated
// Each device has an ID and a type that determines what values it generates
const devices = [
  { device_id: "device001", type: "heart_rate" },
  { device_id: "device002", type: "heart_rate" },
  { device_id: "device003", type: "blood_pressure" },
  { device_id: "device004", type: "blood_pressure" },
  { device_id: "device005", type: "temperature_sensor" },
  { device_id: "device006", type: "oxygen_sensor" },
  { device_id: "device007", type: "glucose_monitor" },
];

/**
 * Generates a realistic random value based on the device type
 * Each device type has its own realistic range
 * Called by: sendReadings()
 */
function generateValue(type) {
  switch (type) {
    case "heart_rate":
      // Normal resting heart rate is 60-100 bpm, we go slightly higher to 120
      return Math.floor(Math.random() * (120 - 60 + 1)) + 60;

    case "blood_pressure":
      // Normal blood pressure range 80-140 mmHg
      return Math.floor(Math.random() * (140 - 80 + 1)) + 80;

    case "temperature_sensor":
      // Normal body temperature 36-38 degrees Celsius
      // parseFloat used so value is a number not a string
      return parseFloat((Math.random() * (38 - 36) + 36).toFixed(1));

    case "oxygen_sensor":
      // Normal blood oxygen saturation is 90-100%
      return Math.floor(Math.random() * (100 - 90 + 1)) + 90;

    case "glucose_monitor":
      // Normal blood glucose range 70-180 mg/dL
      return Math.floor(Math.random() * (180 - 70 + 1)) + 70;

    default:
      return 0;
  }
}

/**
 * Checks Supabase via the API to see if the simulator should be running
 * Returns true by default if the check fails so the simulator keeps running
 * Called by: sendReadings()
 */
export async function isSimulatorRunning() {
  try {
    const res = await axios.get(STATUS_URL);
    return res.data.isRunning;
  } catch {
    // If we can't reach the API, default to running
    return true;
  }
}

/**
 * The main function — checks if running, then sends one reading per device
 * This is what gets called every 3 seconds by simulator.js
 * Called by: simulator.js
 */
export async function sendReadings() {
  // First check if we should be running at all
  const running = await isSimulatorRunning();

  if (!running) {
    console.log("Simulator paused...");
    return;
  }

  // Loop through every device and send a reading
  devices.forEach((device) => {
    const value = generateValue(device.type);

    axios
      .post(ADD_READING_URL, { device_id: device.device_id, value })
      .then(() => console.log(`Sent ${device.type}: ${value}`))
      .catch((err) => console.error("Send error:", err.message));
  });
}