export default async function handler(req, res) {
  try {
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);

    // Example: check if POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Your Supabase logic
    const { device_id, temperature, heart_rate } = req.body;
    console.log("Parsed values:", { device_id, temperature, heart_rate });

    // Insert into Supabase
    const { data, error } = await supabase
      .from("device_readings")
      .insert([{ device_id, temperature, heart_rate }]);

    if (error) {
      console.log("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Reading added", data });
  } catch (error) {
    console.log("CATCH ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}