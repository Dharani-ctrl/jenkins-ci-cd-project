import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./models/Job.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillmatch";

const sampleJobs = [
  {
    title: "React Native Developer",
    company: "Skill-Match",
    location: "Remote",
    salary: "₹80k",
    category: "Developer",
    type: "Full-time",
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studio",
    location: "New York",
    salary: "₹70k",
    category: "Designer",
    type: "Contract",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    // 🔥 Clear existing jobs to avoid duplicates
    await Job.deleteMany({});
    console.log("🗑 Existing jobs cleared");

    await Job.insertMany(sampleJobs);
    console.log("✅ Sample jobs seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
