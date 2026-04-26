const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIX: Max characters for notes context to avoid exceeding API token limits
const MAX_NOTES_CHARS = 20000;

/**
 * Helper to convert file to GoogleGenerativeAI.Part object
 * Handles both local file paths and remote URLs
 */
async function fileToGenerativePart(filePathOrUrl, mimeType) {
  try {
    let buffer;
    if (filePathOrUrl.startsWith('http')) {
      const response = await axios.get(filePathOrUrl, { responseType: 'arraybuffer' });
      buffer = Buffer.from(response.data);
    } else {
      buffer = fs.readFileSync(filePathOrUrl);
    }
    
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType,
      },
    };
  } catch (error) {
    console.error(`Error processing file ${filePathOrUrl}:`, error.message);
    return null;
  }
}

async function askAgent(notes, question, currentFiles = [], history = []) {
  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Question must be a non-empty string.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Try multiple models in case one is overloaded or unavailable
  const modelsToTry = [
    "gemini-2.0-flash", 
    "gemini-flash-latest", 
    "gemini-2.0-flash-lite", 
    "gemini-2.5-flash", 
    "gemini-3-flash-preview",
    "gemini-pro-latest"
  ];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      let notesText =
        notes?.length
          ? notes
              .map((n, i) => {
                const title = n.title?.trim() || `Note ${i + 1}`;
                const description = n.description?.trim() || "(empty)";
                const hasAttachments = n.attachments?.length > 0 ? ` (Attachments: ${n.attachments.map(a => a.name).join(", ")})` : "";
                return `[${i + 1}] ${title}: ${description}${hasAttachments}`;
              })
              .join("\n")
          : "No notes available.";

      if (notesText.length > MAX_NOTES_CHARS) {
        notesText = notesText.slice(0, MAX_NOTES_CHARS) + "\n... [notes truncated]";
      }

      // Build history context (last 10 messages to avoid token bloat)
      const historyText = history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");

      const prompt = `
You are a highly intelligent, helpful, and conversational AI assistant.

Your job is to respond appropriately based on the user's intent, using notes, files, and conversation history when relevant.

──────────────────────────────
🧠 STEP 1: INTENT DETECTION
──────────────────────────────
Classify the user query into one of the following:

1. CASUAL / GREETING  
(e.g., "hello", "hi", "hey", "how are you?")
→ Respond naturally like a human assistant  
→ DO NOT use notes or history  

2. NOTES / FILE RELATED QUESTION  
(e.g., asking about saved notes, uploaded files, or specific stored content)
→ Use NOTES as the PRIMARY source  

3. FOLLOW-UP QUESTION  
→ Use CONVERSATION HISTORY for context  

4. GENERAL QUESTION  
→ Use your general knowledge  

──────────────────────────────
📚 STEP 2: NOTES VALIDATION (CRITICAL)
──────────────────────────────
If the query is related to NOTES:

→ First check if the answer EXISTS in the NOTES section.

IF the answer IS FOUND in notes:
✔ Answer using notes (you may enhance with general knowledge if needed)

IF the answer is NOT FOUND in notes:
✔ Respond EXACTLY like this (in a polite and helpful tone):

"### ⚠️ नोट्स में जानकारी नहीं मिली  
The content related to your question is not present in any of your notes.

However, I can still help you by answering this question using my general knowledge. Just let me know if you'd like me to proceed."

→ DO NOT directly answer the question unless the user confirms

──────────────────────────────
📌 STEP 3: RESPONSE RULES
──────────────────────────────
- Always respond in **clean Markdown format**
- Use:
  - Headings (##, ###)
  - Bold (**text**)
  - Italics (*text*)
  - Bullet points
- Keep answers:
  → Concise but informative  
  → Well-structured  
  → Easy to read  

──────────────────────────────
💻 CODE FORMATTING RULE (STRICT)
──────────────────────────────
- If the response includes code:
  → ALWAYS use proper code blocks with language
  Example:
  \`\`\`js
  console.log("Hello World");
  \`\`\`

──────────────────────────────
🚫 STRICT AVOID
──────────────────────────────
- Do NOT inject notes into unrelated queries  
- Do NOT answer from notes if content is not present  
- Do NOT give robotic or repetitive responses  
- Do NOT over-explain simple greetings  

──────────────────────────────
📚 CONTEXT
──────────────────────────────

NOTES:
${notesText || "No notes available."}

CONVERSATION HISTORY:
${historyText || "No previous messages."}

──────────────────────────────
❓ USER QUESTION
──────────────────────────────
${question.trim()}

──────────────────────────────
💡 FINAL INSTRUCTION
──────────────────────────────
- Detect intent first  
- Validate notes if required  
- Respond accordingly  
- Be natural for casual queries  
- Be structured for informational queries  
`.trim();
      const parts = [prompt];
      if (currentFiles && currentFiles.length > 0) {
        for (const file of currentFiles) {
          const part = await fileToGenerativePart(file.path, file.mimetype);
          if (part) {
            parts.push(part);
          }
        }
      }

      const result = await model.generateContent(parts);
      const text = result.response.text();

      if (text && text.trim()) {
        return text.trim();
      }
    } catch (error) {
      console.warn(`Attempt with ${modelName} failed:`, error.message);
      lastError = error;
      if (error.status === 404 || error.status === 503 || error.status === 429) continue;
      if (error.status === 401 || error.status === 403) break;
    }
  }

  // If we reach here, all models failed
  if (lastError) {
    if (lastError.status === 429) throw new Error("AI Rate limit reached. Please wait a minute.");
    if (lastError.status === 503) throw new Error("AI models overloaded. Please try again.");
    if (lastError.status === 403 || lastError.status === 401) throw new Error("Invalid Gemini API Key.");
    throw new Error(`AI Service error: ${lastError.message}`);
  }

  throw new Error("AI service is currently unavailable. Please try again later.");
}

module.exports = { askAgent };