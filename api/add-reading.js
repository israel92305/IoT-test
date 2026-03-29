import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { device_id, value } = req.body;

  if (!device_id || value === undefined) {
    return res.status(400).json({ error: "device_id and value are required" });
  }

  try {
    const { data, error } = await supabase
      .from("device_readings")
      .insert([{ device_id, value }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Reading added", data });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}