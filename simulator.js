// const axios = require("axios")
import axios from "axios";

// before (local testing)
// const URL = "http://localhost:3000/add-reading"

// after (live backend)
const URL = "https://medintel-iot-backend.vercel.app/api/add-reading";
//check the simulatior file to see if to beging running or not
const STATUS_URL = "https://medintel-iot-backend.vercel.app/api/toggle-simulator";
//All the clinic devices we will be simulating
const devices = [
    { device_id: "device001", type: "heart_rate" },
    { device_id: "device002", type: "heart_rate" },
    { device_id: "device003", type: "blood_pressure" },
    { device_id: "device004", type: "blood_pressure" },
    { device_id: "device005", type: "temperature_sensor" },
    { device_id: "device006", type: "oxygen_sensor" },
    { device_id: "device007", type: "glucose_monitor" }
];

async function isSimulatorRunning() {
    try {
        const res = await axios.get(STATUS_URL);
        return res.data.isRunning;
    } catch (err) {
        return true; // default to running if check fails
    }
}

async function sendReading() {
    const running = await isSimulatorRunning();
    if (!running) {
        console.log("Simulator paused...");
        return;
    }

    devices.forEach(device => {
        let value;
        if (device.type === "heart_rate") {
            value = Math.floor(Math.random() * (120 - 60 + 1)) + 60;
        } else if (device.type === "blood_pressure") {
            value = Math.floor(Math.random() * (140 - 80 + 1)) + 80;
        } else if (device.type === "temperature_sensor") {
            value = parseFloat((Math.random() * (38 - 36) + 36).toFixed(1));
        } else if (device.type === "oxygen_sensor") {
            value = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
        } else if (device.type === "glucose_monitor") {
            value = Math.floor(Math.random() * (180 - 70 + 1)) + 70;
        }

        axios.post(URL, { device_id: device.device_id, value })
            .then(() => console.log(`Sent ${device.type}: ${value}`))
            .catch(err => console.error("Error:", err.message));
    });
}

setInterval(sendReading, 3000);