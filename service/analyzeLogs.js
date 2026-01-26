import fs from "fs";
import path from "path";

// Path to the logs (you can adjust this)
const LOG_FILE_PATH = path.join(process.cwd(), "server", "logs", "server.log");

// Path to the AI prompt template
const PROMPT_FILE_PATH = path.join(process.cwd(), "service", "prompt.txt");

// Function to read logs
const readLogs = () => {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    console.log("❌ Log file not found:", LOG_FILE_PATH);
    return "";
  }
  return fs.readFileSync(LOG_FILE_PATH, "utf-8");
};

// Function to read AI prompt template
const readPromptTemplate = () => {
  if (!fs.existsSync(PROMPT_FILE_PATH)) {
    console.log("❌ Prompt file not found:", PROMPT_FILE_PATH);
    return "";
  }
  return fs.readFileSync(PROMPT_FILE_PATH, "utf-8");
};

// Analyze logs
const analyzeLogs = () => {
  const logs = readLogs();
  const promptTemplate = readPromptTemplate();

  if (!logs || !promptTemplate) return;

  const combinedPrompt = promptTemplate.replace("{{LOGS}}", logs);

  // Here you could send combinedPrompt to an AI model
  console.log("✅ AI Prompt ready:\n", combinedPrompt);
};

// Run analysis
analyzeLogs();
