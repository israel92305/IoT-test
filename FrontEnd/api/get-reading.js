export default async function handler(req, res) {
    // Allow frontend browser access
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "GET") {
        try {
            // 🔥 Replace this with your real DB query
            const vitals = [
                { time: "10:00", heartRate: 80, temperature: 36.5, oxygen: 98 },
                { time: "10:01", heartRate: 85, temperature: 36.7, oxygen: 97 },
                { time: "10:02", heartRate: 90, temperature: 37.0, oxygen: 96 }
            ];

            res.status(200).json(vitals);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch readings" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}