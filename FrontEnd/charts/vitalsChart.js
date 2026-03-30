// vitalsChart.js

const ctx = document.getElementById("vitalsChart").getContext("2d");

// Initialize the chart
const vitalsChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],       // Time labels
        datasets: []      // Dynamic vitals datasets
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: { position: "top" }
        },
        scales: {
            y: { beginAtZero: false }
        }
    }
});

// Keep track of historical readings (max 20 points)
let vitalsHistory = [];

// Update chart with new data
function updateChart(data) {
    if (!data || data.length === 0) return;

    // Add new data to history
    vitalsHistory.push(...data);

    // Keep only the last 20 points
    if (vitalsHistory.length > 20) {
        vitalsHistory = vitalsHistory.slice(-20);
    }

    // Extract all vitals dynamically (keys except "time")
    const keys = Object.keys(vitalsHistory[0]).filter(key => key !== "time");

    // Update labels (time)
    vitalsChart.data.labels = vitalsHistory.map(d => d.time);

    // Update datasets
    vitalsChart.data.datasets = keys.map((key, index) => {
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
        return {
            label: key,
            data: vitalsHistory.map(d => d[key]),
            borderColor: colors[index % colors.length],
            backgroundColor: "transparent",
            borderWidth: 2
        };
    });

    vitalsChart.update();
}

// Fetch real vitals from the DB via your Vercel API
async function fetchVitals() {
    try {
        const response = await fetch("https://medintel-iot-backend.vercel.app/api/get-readings");
        const data = await response.json();  // This should return an array of readings
        updateChart(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Auto-refresh every 3 seconds
setInterval(fetchVitals, 3000);

// Initial fetch to start chart
fetchVitals();