import express from "express";
import BuildPrediction from "../models/BuildPrediction.js";

const router = express.Router();

// GET /api/predictions — Return all build predictions (newest first)
router.get("/", async (req, res) => {
    try {
        const predictions = await BuildPrediction.find().sort({ createdAt: -1 }).limit(50);
        res.json(predictions);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch predictions: " + err.message });
    }
});

// GET /api/predictions/stats — Return summary stats for the dashboard
router.get("/stats", async (req, res) => {
    try {
        const total = await BuildPrediction.countDocuments();
        const successes = await BuildPrediction.countDocuments({ mlStatus: "SUCCESS" });
        const failures = await BuildPrediction.countDocuments({ mlStatus: "FAILURE" });
        const avgDurationResult = await BuildPrediction.aggregate([
            { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
        ]);
        const avgDuration = avgDurationResult[0]?.avgDuration?.toFixed(1) || 0;
        res.json({ total, successes, failures, avgDuration });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats: " + err.message });
    }
});

// POST /api/predictions — Save a new build prediction result (called from Jenkins via savePrediction.js)
router.post("/", async (req, res) => {
    try {
        const prediction = new BuildPrediction(req.body);
        await prediction.save();
        res.status(201).json({ message: "Prediction saved successfully", prediction });
    } catch (err) {
        res.status(400).json({ error: "Failed to save prediction: " + err.message });
    }
});

export default router;
