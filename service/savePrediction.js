/**
 * savePrediction.js
 * Called by Jenkins after the ML and Gemini AI stages to save the build result to MongoDB.
 *
 * Usage (from Jenkinsfile):
 *   node savePrediction.js <mlStatus> <mlConfidence> <geminiStatus> "<geminiSummary>"
 */
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "server", ".env") });

// ---- Read data from command-line args or Jenkins env variables ----
const ML_STATUS = process.argv[2] || process.env.ML_STATUS || "UNKNOWN";
const ML_CONFIDENCE = process.argv[3] || process.env.ML_CONFIDENCE || "0";
const GEMINI_STATUS = process.argv[4] || process.env.GEMINI_STATUS || "SKIPPED";
const GEMINI_SUMMARY = process.argv[5] || process.env.GEMINI_SUMMARY || "";

// Jenkins built-in environment variables
const BUILD_NUMBER = process.env.BUILD_NUMBER || "local";
const GIT_COMMIT = process.env.GIT_COMMIT || "local";
const BRANCH_NAME = process.env.BRANCH_NAME || "main";

// Real metrics passed from Jenkinsfile
const DURATION = parseFloat(process.env.BUILD_DURATION_SECS || "0");
const WARNINGS = parseInt(process.env.BUILD_WARNINGS || "0");
const ERRORS = parseInt(process.env.BUILD_ERRORS || "0");
const LINES_CHANGED = parseInt(process.env.LINES_CHANGED || "0");
const TEST_PASS_RATE = parseFloat(process.env.TEST_PASS_RATE || "100");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const payload = {
    buildNumber: BUILD_NUMBER,
    commitHash: GIT_COMMIT?.substring(0, 7),
    branch: BRANCH_NAME,
    duration: DURATION,
    warnings: WARNINGS,
    errorCount: ERRORS,
    linesChanged: LINES_CHANGED,
    testPassRate: TEST_PASS_RATE,
    mlStatus: ML_STATUS,
    mlConfidence: parseFloat(ML_CONFIDENCE),
    geminiStatus: GEMINI_STATUS,
    geminiSummary: GEMINI_SUMMARY,
};

console.log("[SAVE] Saving build prediction to MongoDB...");
console.log("[SAVE] Payload:", JSON.stringify(payload, null, 2));

try {
    const response = await fetch(`${SERVER_URL}/api/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        const data = await response.json();
        console.log("[SAVE] Prediction saved successfully:", data.prediction._id);
    } else {
        const err = await response.text();
        console.error("[SAVE] Server responded with error:", err);
    }
} catch (err) {
    console.error("[SAVE] Failed to connect to server:", err.message);
    console.log("[SAVE] Note: Server may not be running locally. Prediction not saved.");
}
