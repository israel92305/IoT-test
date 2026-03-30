// api/get-readings.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
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
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const grouped = {};

    data.forEach((row) => {
      const time = new Date(row.recorded_at).toLocaleTimeString();
      const deviceType = row.devices?.device_type;

      if (!grouped[time]) {
        grouped[time] = { time };
      }

      if (grouped[time][deviceType] === undefined) {
        grouped[time][deviceType] = row.value;
      } else {
        grouped[time][deviceType] =
          (grouped[time][deviceType] + row.value) / 2;
      }
    });

    const result = Object.values(grouped).reverse().slice(-20);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}