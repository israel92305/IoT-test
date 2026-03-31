import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
        // Step 1 — test Supabase connection
        const { data, error } = await supabase
            .from("device_readings")
            .select(`value, recorded_at, devices(device_id, device_type)`)
            .order("recorded_at", { ascending: false })
            .limit(10);

        if (error) return res.status(500).json({ step: "supabase", error: error.message });
        if (!data || data.length === 0) return res.status(500).json({ step: "supabase", error: "no data returned" });

        // Step 2 — test Gemini connection
        const geminiRes = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Reply with just the word: ok" }] }]
            })
        });

        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) return res.status(500).json({ step: "gemini", error: geminiData });

        res.status(200).json({
            step: "all good",
            supabase_rows: data.length,
            gemini_response: geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        });

    } catch (err) {
        res.status(500).json({ step: "catch", error: err.message });
    }
}