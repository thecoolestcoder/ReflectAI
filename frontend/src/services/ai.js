import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generates a response based on the user's query and their notes.
 */
export async function askAI(query, notes) {
  try {
    // 1. Convert notes into a single context string
    const notesContext = notes
      .map(
        (note) =>
          `Title: ${note.title}\nTags: [${note.tags.join(", ")}]\nContent: ${note.content}`,
      )
      .join("\n---\n");

    // 2. Construct the prompt
    const prompt = `
      You are an intelligent assistant for a personal knowledge base.
      Here are the user's notes:

      ${notesContext}

      User Question: "${query}"

      Instructions:
      - Answer based strictly on the provided notes if possible.
      - If the answer isn't in the notes, use your general knowledge but mention that it's not in the notes.
      - Be concise and helpful.
    `;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to the AI right now. Please check your internet connection or API key.";
  }
}

/**
 * Analyzes a URL or text content (For your Links Tab)
 */
export async function analyzeContent(text) {
  try {
    const prompt = `
      Analyze the following text. Provide:
      1. A concise summary (max 3 sentences).
      2. 5 key topics/tags.
      3. An assessment of the sentiment (Positive/Neutral/Negative).

      Text to analyze:
      ${text.substring(0, 10000)} ... [truncated if too long]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Failed to analyze content.";
  }
}
