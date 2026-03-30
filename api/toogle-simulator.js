// api/toggle-simulator.js

let isRunning = true;

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "POST") {
        const { action } = req.body;
        if (action === "start") isRunning = true;
        if (action === "stop") isRunning = false;
        return res.status(200).json({ isRunning });
    }

    if (req.method === "GET") {
        return res.status(200).json({ isRunning });
    }

    res.status(405).json({ error: "Method not allowed" });
}