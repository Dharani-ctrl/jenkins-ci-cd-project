// ============================================================
// app.js — CI/CD Pipeline Dashboard
// Fetches build predictions from the Express API and renders
// the stats, chart, and build history table.
// ============================================================

const API_BASE = window.location.origin; // e.g. http://13.211.153.37:5000

async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/api/predictions/stats`);
        const data = await res.json();
        document.getElementById("stat-total").textContent = data.total ?? "--";
        document.getElementById("stat-success").textContent = data.successes ?? "--";
        document.getElementById("stat-failures").textContent = data.failures ?? "--";
        document.getElementById("stat-avg-duration").textContent = data.avgDuration ?? "--";
    } catch (err) {
        console.error("Failed to load stats:", err);
    }
}

async function fetchPredictions() {
    const res = await fetch(`${API_BASE}/api/predictions`);
    if (!res.ok) throw new Error("API request failed: " + res.status);
    return await res.json();
}

function renderTable(predictions) {
    const tbody = document.getElementById("build-tbody");
    if (!predictions.length) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No builds recorded yet. Trigger a Jenkins build first!</td></tr>`;
        return;
    }

    tbody.innerHTML = predictions.map(p => {
        const mlBadge = badgeHtml(p.mlStatus);
        const geminiBadge = badgeHtml(p.geminiStatus);
        const ts = new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
        return `
      <tr>
        <td><strong>#${p.buildNumber}</strong></td>
        <td><code>${p.commitHash || "N/A"}</code></td>
        <td>${p.branch}</td>
        <td>${p.duration}s</td>
        <td>${p.errors}</td>
        <td>${p.testPassRate}%</td>
        <td>${mlBadge}</td>
        <td>${p.mlConfidence ? p.mlConfidence.toFixed(1) + "%" : "N/A"}</td>
        <td>${geminiBadge}</td>
        <td>${ts}</td>
      </tr>`;
    }).join("");
}

function badgeHtml(status) {
    const cls = status === "SUCCESS" ? "badge-success"
        : status === "FAILURE" ? "badge-failure"
            : "badge-unknown";
    return `<span class="badge ${cls}">${status ?? "UNKNOWN"}</span>`;
}

function renderChart(predictions) {
    const recent = predictions.slice(0, 15).reverse(); // show oldest → newest in chart
    const labels = recent.map(p => `#${p.buildNumber}`);
    const successData = recent.map(p => p.mlStatus === "SUCCESS" ? 1 : 0);
    const failureData = recent.map(p => p.mlStatus === "FAILURE" ? 1 : 0);

    const ctx = document.getElementById("buildChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "SUCCESS",
                    data: successData,
                    backgroundColor: "rgba(16,185,129,0.7)",
                    borderColor: "rgba(16,185,129,1)",
                    borderWidth: 1,
                    borderRadius: 6,
                },
                {
                    label: "FAILURE",
                    data: failureData,
                    backgroundColor: "rgba(239,68,68,0.7)",
                    borderColor: "rgba(239,68,68,1)",
                    borderWidth: 1,
                    borderRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#94a3b8", boxRadius: 4 } },
                tooltip: { mode: "index", intersect: false },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { color: "#64748b" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    stacked: true,
                    ticks: { color: "#64748b", stepSize: 1 },
                    grid: { color: "rgba(255,255,255,0.05)" },
                    max: 1.2,
                },
            },
        },
    });
}

async function init() {
    await fetchStats();
    try {
        const predictions = await fetchPredictions();
        renderTable(predictions);
        renderChart(predictions);
    } catch (err) {
        document.getElementById("build-tbody").innerHTML = `
      <tr><td colspan="10" class="empty-state">
        Could not connect to the API. Make sure the server is running at <strong>${API_BASE}</strong>.
      </td></tr>`;
        console.error(err);
    }
}

// Refresh every 30 seconds automatically
init();
setInterval(init, 30_000);
