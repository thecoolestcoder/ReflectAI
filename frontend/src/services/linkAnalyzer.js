import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetch } from "@tauri-apps/plugin-http"; // Required to bypass CORS

// Initialize a separate Gemini instance for this service
// You can reuse the same API key environment variable
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Use a model optimized for speed and cost, as web pages can be token-heavy
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json", // Enforces strict JSON output
  },
});

/**
 * Orchestrates the full link analysis flow: Fetch -> Clean -> Analyze
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} - Structured analysis data
 */
export async function analyzeLink(url) {
  try {
    // 1. Fetch content (Bypassing CORS via Tauri)
    const rawHtml = await fetchHtmlContent(url);

    // 2. Clean content (Remove noise like scripts, styles, navs)
    const cleanText = extractMainContent(rawHtml);

    if (cleanText.length < 50) {
      throw new Error("Could not extract enough readable text from this link.");
    }

    // 3. Analyze with Gemini
    const analysis = await generateGeminiAnalysis(cleanText, url);

    return analysis;
  } catch (error) {
    console.error("Link Analysis Service Error:", error);
    throw error; // Re-throw so the UI can display the error
  }
}

/**
 * Helper: Fetches raw HTML using Tauri's HTTP plugin
 */
async function fetchHtmlContent(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load page (Status: ${response.status})`);
  }

  return await response.text();
}

/**
 * Helper: Cleans HTML to save tokens and improve AI focus
 */
function extractMainContent(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove junk elements
  const junkSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "header",
    "footer",
    "nav",
    "aside",
    ".ad",
    ".ads",
    ".cookie-banner",
  ];

  junkSelectors.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Get text content and normalize whitespace
  let text = doc.body.textContent || "";
  text = text.replace(/\s+/g, " ").trim();

  // Limit to ~15,000 characters to prevent token limit errors on huge pages
  return text.slice(0, 15000);
}

/**
 * Helper: Sends prompt to Gemini
 */
async function generateGeminiAnalysis(text, originalUrl) {
  const prompt = `
    Analyze the following web page content.
    Return a valid JSON object with these exact keys:

    {
      "summary": "A concise, objective summary (max 3 sentences)",
      "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "sentiment": "Positive" | "Neutral" | "Negative",
      "readingTime": "Estimated reading time (e.g., '5 min read')"
    }

    Web Page Content:
    ${text}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parse JSON (Gemini 1.5 usually respects responseMimeType, but we stay safe)
  try {
    const data = JSON.parse(responseText);

    // Merge with metadata required by your UI
    return {
      url: originalUrl,
      domain: new URL(originalUrl).hostname,
      summary: data.summary || "No summary available",
      keywords: data.keywords || [],
      wordCount: text.split(" ").length,
      sentiment: data.sentiment || "Neutral",
      // Optional extra fields
      readingTime: data.readingTime,
    };
  } catch (e) {
    console.error("JSON Parse Error", responseText);
    throw new Error("AI returned invalid data format.");
  }
}
