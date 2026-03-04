/**
 * extractMetrics.js
 * Reads Jenkins test output and server logs and extracts real CI/CD metrics.
 * Outputs environment variable exports that Jenkins picks up for the ML predictor.
 *
 * Usage: node extractMetrics.js
 * Output: metrics.env (a file with env vars for Jenkinsfile to load)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Config ----
const LOG_FILE = path.join(__dirname, "..", "server", "logs", "server.log");
const TEST_OUTPUT = path.join(__dirname, "..", "server", "test-results.txt");
const OUTPUT_FILE = path.join(__dirname, "metrics.env");

// Jenkins provides these natively
const BUILD_TIMESTAMP = parseInt(process.env.BUILD_START_TIME || Date.now());
const BUILD_DURATION_MS = Date.now() - BUILD_TIMESTAMP;
const BUILD_DURATION_SECS = Math.round(BUILD_DURATION_MS / 1000) || 60;

function countKeywordsInFile(filePath, keywords) {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, "utf-8").toLowerCase();
    return keywords.reduce((count, kw) => {
        const regex = new RegExp(kw.toLowerCase(), "g");
        const matches = content.match(regex);
        return count + (matches ? matches.length : 0);
    }, 0);
}

function extractTestPassRate(filePath) {
    if (!fs.existsSync(filePath)) return 100; // Assume 100% pass if no output file
    const content = fs.readFileSync(filePath, "utf-8");

    // Jest output: "Tests: X passed, Y total"
    const totalMatch = content.match(/Tests:\s+.*?(\d+)\s+total/);
    const passedMatch = content.match(/(\d+)\s+passed/);

    const total = totalMatch ? parseInt(totalMatch[1]) : 1;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 1;

    return total > 0 ? Math.round((passed / total) * 100) : 100;
}

// ---- Extract Metrics ----
const warnings = countKeywordsInFile(TEST_OUTPUT, ["warn", "warning", "deprecated"]);
const errors = countKeywordsInFile(LOG_FILE, ["error", "exception", "fatal", "crash", "failed"]);
const testPassRate = extractTestPassRate(TEST_OUTPUT);

// Lines changed this commit (via git diff)
let linesChanged = 0;
try {
    // This env var is set in the Jenkinsfile from a git diff command
    linesChanged = parseInt(process.env.LINES_CHANGED || "0");
} catch (_) { /* ignore */ }

const metrics = {
    BUILD_DURATION_SECS,
    BUILD_WARNINGS: warnings,
    BUILD_ERRORS: errors,
    TEST_PASS_RATE: testPassRate,
    LINES_CHANGED: linesChanged,
};

// Write metrics to a file that Jenkinsfile can load
const envContent = Object.entries(metrics)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

fs.writeFileSync(OUTPUT_FILE, envContent);

console.log("[METRICS] Extracted real Jenkins build metrics:");
Object.entries(metrics).forEach(([k, v]) => console.log(`  ${k}=${v}`));
console.log(`[METRICS] Written to ${OUTPUT_FILE}`);
