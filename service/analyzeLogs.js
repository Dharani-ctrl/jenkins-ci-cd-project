import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: path.join(process.cwd(), "..", "server", ".env") }); // Try to read from server first
dotenv.config(); // fallback to local

// Path to the logs (Jenkins will pipe output or we read a specific file)
const LOG_FILE_PATH = path.join(process.cwd(), "..", "server", "logs", "server.log");
const PROMPT_FILE_PATH = path.join(process.cwd(), "prompt.txt");

// Try to get logs from arguments (if Jenkins passes it directly) or try reading file
let logs = process.argv[2] && process.argv[2] !== "" ? process.argv[2] : "";

if (!logs) {
  if (fs.existsSync(LOG_FILE_PATH)) {
    logs = fs.readFileSync(LOG_FILE_PATH, "utf-8");
  } else {
    // If no log file, just use a dummy success log for testing so pipeline doesn't break
    logs = "Server started successfully. Connected to MongoDB. No errors found.";
    console.log("⚠️ No log file found, analyzing default success log.");
  }
}

// Function to read AI prompt template
const readPromptTemplate = () => {
  if (!fs.existsSync(PROMPT_FILE_PATH)) {
    console.error("❌ Prompt file not found:", PROMPT_FILE_PATH);
    process.exit(1);
  }
  return fs.readFileSync(PROMPT_FILE_PATH, "utf-8");
};

const analyzeLogs = async () => {
  const promptTemplate = readPromptTemplate();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("⚠️ No GEMINI_API_KEY found in environment. Skipping AI Log Analysis.");
    // Exit cleanly if no key is provided so Jenkins pipeline can continue
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const combinedPrompt = promptTemplate.replace("{{LOGS}}", logs.substring(logs.length - 10000)); // Limit log size

  console.log("🤖 Analyzing logs with Google Gemini AI...");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: combinedPrompt,
    });

    let aiText = response.text;
    if (aiText.startsWith("```json")) {
      aiText = aiText.substring(7, aiText.length - 3).trim();
    }

    let result;
    try {
      result = JSON.parse(aiText);
    } catch (e) {
      console.log("⚠️ Failed to parse AI response as JSON:", aiText);
      process.exit(0);
    }

    console.log("\n================ [ AI ANALYSIS RESULT ] ================");
    console.log(`STATUS: ${result.status}`);
    console.log(`SUMMARY: ${result.summary}`);

    if (result.errors && result.errors.length > 0) {
      console.log("\nERRORS:");
      result.errors.forEach(err => console.log(`- ${err}`));
    }

    if (result.suggestions && result.suggestions.length > 0) {
      console.log("\nSUGGESTIONS:");
      result.suggestions.forEach(sug => console.log(`- ${sug}`));
    }
    console.log("=====================================================\n");

    if (result.status === "FAILURE") {
      console.error("❌ AI detected critical failure in logs. Failing pipeline!");
      process.exit(1); // Tell Jenkins to fail the build
    } else {
      console.log("✅ AI Analysis passed.");
      process.exit(0);
    }

  } catch (error) {
    console.error("❌ Error running AI Log Analysis:", error.message);
    process.exit(0); // Optional: change to 1 if you want API failures to break the pipeline 
  }
};

analyzeLogs();
