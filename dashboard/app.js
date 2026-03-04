// ============================================================
// app.js — Advanced CI/CD AI Dashboard
// ============================================================

const API_BASE = window.location.origin;
let lastBuildCount = 0;

// Chart Instances (to allow updating)
let charts = {
    status: null,
    trend: null,
    confidence: null
};

/**
 * Fetch summary stats for cards
 */
async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/api/predictions/stats`);
        const data = await res.json();
        const els = {
            total: document.getElementById("stat-total"),
            success: document.getElementById("stat-success"),
            failures: document.getElementById("stat-failures"),
            duration: document.getElementById("stat-avg-duration")
        };

        // Counter animation effect
        animateValue(els.total, parseInt(els.total.innerText) || 0, data.total, 500);
        animateValue(els.success, parseInt(els.success.innerText) || 0, data.successes, 500);
        animateValue(els.failures, parseInt(els.failures.innerText) || 0, data.failures, 500);
        els.duration.innerText = data.avgDuration ?? "--";

        document.getElementById("last-updated").innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error("Stats error:", err);
    }
}

/**
 * Helper: Smooth number animation
 */
function animateValue(obj, start, end, duration) {
    if (!obj || isNaN(end)) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Fetch all predictions
 */
async function fetchPredictions() {
    const res = await fetch(`${API_BASE}/api/predictions`);
    if (!res.ok) throw new Error("API failed");
    return await res.json();
}

/**
 * Render Build Table with Expandable Gemini Summaries
 */
function renderTable(predictions) {
    const tbody = document.getElementById("build-tbody");
    if (!predictions.length) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No builds recorded. Trigger Jenkins!</td></tr>`;
        return;
    }

    tbody.innerHTML = predictions.map(p => {
        const mlBadge = badgeHtml(p.mlStatus);
        const geminiBadge = badgeHtml(p.geminiStatus);
        const ts = new Date(p.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

        return `
            <tr class="build-row" onclick="toggleSummary('${p._id}')" id="row-${p._id}">
                <td><strong>#${p.buildNumber}</strong></td>
                <td><code>${p.commitHash || "N/A"}</code></td>
                <td>${p.branch}</td>
                <td>${p.duration}s</td>
                <td>${p.errorCount || 0}</td>
                <td>${p.testPassRate}%</td>
                <td>${mlBadge}</td>
                <td>${p.mlConfidence ? p.mlConfidence.toFixed(1) + "%" : "--"}</td>
                <td>${geminiBadge}</td>
                <td style="color: var(--text-muted); font-size: 11px;">${ts}</td>
            </tr>
            <tr class="gemini-summary-row" id="sum-${p._id}">
                <td colspan="10">
                    <div class="gemini-content">
                        <div class="gemini-card">
                            <div class="gemini-icon">✨</div>
                            <div class="gemini-text">
                                <strong>AI Analysis:</strong><br/>
                                ${p.geminiSummary || "Detailed analysis logs were not captured for this build."}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function toggleSummary(id) {
    const row = document.getElementById(`row-${id}`);
    const summary = document.getElementById(`sum-${id}`);
    const allSummaries = document.querySelectorAll(".gemini-summary-row");
    const allRows = document.querySelectorAll(".build-row");

    // Close others
    allSummaries.forEach(s => { if (s.id !== `sum-${id}`) s.classList.remove("active"); });
    allRows.forEach(r => { if (r.id !== `row-${id}`) r.classList.remove("active"); });

    // Toggle current
    row.classList.toggle("active");
    summary.classList.toggle("active");
}

function badgeHtml(status) {
    const cls = status === "SUCCESS" ? "badge-success" : status === "FAILURE" ? "badge-failure" : "badge-unknown";
    return `<span class="badge ${cls}">${status ?? "UNKNOWN"}</span>`;
}

/**
 * Render All Advanced Charts
 */
function renderCharts(predictions) {
    const latest = predictions.slice(0, 15).reverse();

    // 1. Status Breakdown (Donut)
    const successCount = predictions.filter(p => p.mlStatus === "SUCCESS").length;
    const failureCount = predictions.filter(p => p.mlStatus === "FAILURE").length;
    updateStatusChart(successCount, failureCount);

    // 2. Duration Trend (Line)
    updateDurationChart(latest);

    // 3. AI Confidence History (Area)
    updateConfidenceChart(latest);
}

function updateStatusChart(success, failure) {
    const ctx = document.getElementById("statusBreakdownChart").getContext("2d");
    if (charts.status) charts.status.destroy();

    charts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Success', 'Failure'],
            datasets: [{
                data: [success, failure],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

function updateDurationChart(data) {
    const ctx = document.getElementById("durationTrendChart").getContext("2d");
    if (charts.trend) charts.trend.destroy();

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(p => `#${p.buildNumber}`),
            datasets: [{
                label: 'Duration (s)',
                data: data.map(p => p.duration),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { display: false } },
                y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateConfidenceChart(data) {
    const ctx = document.getElementById("confidenceAreaChart").getContext("2d");
    if (charts.confidence) charts.confidence.destroy();

    charts.confidence = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(p => `#${p.buildNumber}`),
            datasets: [{
                label: 'AI Confidence',
                data: data.map(p => p.mlConfidence || 0),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.2,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { display: false } },
                y: { min: 0, max: 100, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

async function init() {
    await fetchStats();
    try {
        const predictions = await fetchPredictions();
        renderTable(predictions);
        renderCharts(predictions);
    } catch (err) {
        console.error("Init failed:", err);
    }
}

// Global scope for onclick
window.toggleSummary = toggleSummary;

init();
setInterval(init, 30000); // 30s auto-refresh
