import Job from "../models/Job.js";

export const getJobs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    
    // Ensure you return an object with a 'jobs' property
    res.status(200).json({ 
      success: true, 
      jobs: jobs // This must match the 'data.jobs' in Home.tsx
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};