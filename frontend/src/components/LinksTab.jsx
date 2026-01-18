import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { analyzeLink } from "../services/linkAnalyzer";
import "../styles/LinksTab.css";

export default function LinksTab({ onLinkAnalyzed, setActiveTab }) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // Session history state - kept even after redirect if component stays mounted
  const [analyzedLinks, setAnalyzedLinks] = useState([]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    try {
      setError("");
      setAnalyzing(true);

      // 1. Analyze the Link
      const result = await analyzeLink(url);

      // 2. Auto-Save to Database immediately (Default behavior)
      await invoke("add_note", {
        title: `Analysis: ${result.domain}`,
        content: `Source: ${result.url}\n\n## Summary\n${result.summary}\n\n## Keywords\n${result.keywords.join(", ")}\n\n## Sentiment\n${result.sentiment || "Neutral"}`,
        tags: [
          "gemini-analysis",
          result.domain,
          ...result.keywords.slice(0, 3),
        ],
      });

      // 3. Update Local History
      const newLink = {
        id: Date.now().toString(),
        ...result,
        analyzedAt: new Date().toLocaleString(),
      };
      setAnalyzedLinks((prev) => [newLink, ...prev]);

      // 4. Cleanup & Redirect
      setUrl("");
      onLinkAnalyzed(); // Refresh the notes list in the sidebar/parent

      // Switch to Notes tab to see the result
      if (setActiveTab) {
        setActiveTab("notes");
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message || err}`);
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = (id) => {
    setAnalyzedLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <div className="links-tab section">
      <div className="links-container">
        {/* Analysis Form */}
        <div className="card form-card">
          <h3>Analyze a Link with Gemini</h3>
          <p className="helper-text">
            Enter a URL below. The AI will analyze it, automatically save it as
            a note, and redirect you to the notes view.
          </p>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://example.com/article"
                disabled={analyzing}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={analyzing}
              >
                {analyzing ? "Analyzing & Saving..." : "Analyze & Save"}
              </button>
            </div>
          </form>
        </div>

        {/* History List (Visible if user switches back to this tab) */}
        {analyzedLinks.length > 0 && (
          <div className="links-list">
            <h3>Session History</h3>
            {analyzedLinks.map((link) => (
              <div key={link.id} className="card link-card">
                <div className="card-header">
                  <div className="link-header-content">
                    <span className="link-domain">{link.domain}</span>
                    <div className="card-meta">{link.analyzedAt}</div>
                  </div>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(link.id)}
                    title="Remove from history"
                  >
                    ✕
                  </button>
                </div>
                <div className="link-summary">
                  <p>{link.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
