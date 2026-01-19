import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Developer, Designer
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], default: 'Full-time' },
  description: { type: String },
  logo: { type: String }, // URL for company logo
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);