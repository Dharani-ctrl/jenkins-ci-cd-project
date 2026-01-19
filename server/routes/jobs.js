import express from "express";
import { getJobs } from "../controllers/jobController.js";

const router = express.Router();

// ✅ GET ALL JOBS (with Search and Category support)
router.get("/", getJobs);

export default router;