import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const workspaceRoot = process.cwd();
// Try to load environment variables from the server directory
dotenv.config({ path: path.join(workspaceRoot, "server", ".env") });
dotenv.config();

// Extract job name and build number from Jenkins environment
const jobName = process.env.JOB_NAME;
const buildNumber = process.env.BUILD_NUMBER;
let logPath = "";

if (jobName && buildNumber) {
    // Handle potential folder paths in Jenkins
    const jobPath = jobName.split('/').join('/jobs/');
    logPath = `C:\\ProgramData\\Jenkins\\.jenkins\\jobs\\${jobPath}\\builds\\${buildNumber}\\log`;
}

let logs = "";
if (fs.existsSync(logPath)) {
    logs = fs.readFileSync(logPath, "utf-8");
} else {
    console.log(` Jenkins build log not found at ${logPath}`);
    logs = "Pipeline failed. Could not read Jenkins build log to determine the specific error context.";
}

const analyzeFailure = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const summaryFilePath = path.join(workspaceRoot, "service", "failure_summary.env");

    if (!apiKey) {
        fs.writeFileSync(summaryFilePath, `GEMINI_SUMMARY=Pipeline failed. AI log analysis skipped (missing API key).`);
        console.log(" No GEMINI_API_KEY found. Skipping AI analysis.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Take the last 15000 characters to capture the root cause of the failure near the end of the log
    const logSnippet = logs.substring(Math.max(0, logs.length - 15000));
    
    const prompt = `You are a DevOps AI assistant analyzing a failed Jenkins CI/CD pipeline.
Below is the tail of the Jenkins build log.
Analyze the log and provide a very concise, 1-2 sentence summary of exactly what caused the failure.
Do not format as JSON. Just return the plain text summary.
Be direct. DO NOT use quotes (") inside the text, as it will break environment variables.
For example, if it's a test failure, mention the specific test. If it's a deployment error (like no space left on device), state that.

JENKINS LOG:
${logSnippet}
`;

    try {
        console.log(" Analyzing failure reason from Jenkins logs with Gemini AI...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Clean up text for batch file env variable
        let summary = response.text.trim().replace(/\n/g, ' ').replace(/"/g, "'"); 
        console.log(`[AI SUMMARY] ${summary}`);
        fs.writeFileSync(summaryFilePath, `GEMINI_SUMMARY=${summary}`);
    } catch (error) {
        console.error(" Failed to analyze logs:", error.message);
        fs.writeFileSync(summaryFilePath, `GEMINI_SUMMARY=Pipeline failed. AI log analysis encountered an error.`);
    }
}

analyzeFailure();
