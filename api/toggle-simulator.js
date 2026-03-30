import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method === "POST") {
        const { action } = req.body;
        const isRunning = action === "start" ? "true" : "false";

        const { error } = await supabase
            .from("settings")
            .update({ value: isRunning })
            .eq("key", "simulator_running");

        if (error) return res.status(500).json({ error: error.message });

        return res.status(200).json({ isRunning: isRunning === "true" });
    }

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "simulator_running")
            .single();

        if (error) return res.status(500).json({ error: error.message });

        return res.status(200).json({ isRunning: data.value === "true" });
    }

    res.status(405).json({ error: "Method not allowed" });
}