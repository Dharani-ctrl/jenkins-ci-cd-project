import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // --- New Fields ---
    phone: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    website: { type: String, default: "" },
    bio: { type: String, default: "Job Seeker" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);