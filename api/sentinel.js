import { createClient } from "@supabase/supabase-js";

//call the supabase keys
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

//call the gemini API KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Step 1 — fetch latest readings from Supabase
        const { data, error } = await supabase
            .from("device_readings")
            .select(`
                value,
                recorded_at,
                devices (
                    device_id,
                    device_type
                )
            `)
            .order("recorded_at", { ascending: false })
            .limit(50);

        if (error) return res.status(500).json({ error: error.message });

        // Step 2 — group latest value per device type
        const latestVitals = {};
        data.forEach(row => {
            const type = row.devices?.device_type;
            if (type && latestVitals[type] === undefined) {
                latestVitals[type] = row.value;
            }
        });

        // Step 3 — build prompt for Gemini
        const prompt = `
You are Sentinel, an AI medical monitoring assistant.
Analyze the following patient vitals and respond in JSON only.

Patient vitals:
- Heart Rate: ${latestVitals.heart_rate ?? "N/A"} bpm
- Blood Pressure: ${latestVitals.blood_pressure ?? "N/A"} mmHg
- Oxygen Saturation: ${latestVitals.oxygen_saturation ?? "N/A"} %
- Temperature: ${latestVitals.temperature ?? "N/A"} °C
- Glucose: ${latestVitals.glucose ?? "N/A"} mg/dL

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

        // Step 4 — send to Gemini
        const geminiRes = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const geminiData = await geminiRes.json();

        // Step 5 — extract and parse Gemini response
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const clean = rawText.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(clean);

        res.status(200).json(analysis);

    } catch (err) {
        console.error("Sentinel error:", err);
        res.status(500).json({ error: "Sentinel analysis failed" });
    }
}