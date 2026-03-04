import mongoose from "mongoose";

const buildPredictionSchema = new mongoose.Schema(
    {
        buildNumber: { type: String, default: "N/A" },
        commitHash: { type: String, default: "N/A" },
        branch: { type: String, default: "main" },
        // --- ML Input Metrics ---
        duration: { type: Number, default: 0 }, // seconds
        warnings: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        linesChanged: { type: Number, default: 0 },
        testPassRate: { type: Number, default: 100 }, // %
        // --- ML Output ---
        mlStatus: { type: String, enum: ["SUCCESS", "FAILURE", "UNKNOWN"], default: "UNKNOWN" },
        mlConfidence: { type: Number, default: 0 }, // %
        // --- Gemini AI Output ---
        geminiStatus: { type: String, enum: ["SUCCESS", "FAILURE", "SKIPPED"], default: "SKIPPED" },
        geminiSummary: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("BuildPrediction", buildPredictionSchema);
