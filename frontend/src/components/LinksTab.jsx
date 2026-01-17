import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { analyzeLink } from "../services/linkAnalyzer";
import "../styles/LinksTab.css";

export default function LinksTab({ onLinkAnalyzed }) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedLinks, setAnalyzedLinks] = useState([]);
  const [error, setError] = useState("");
  const [autoSave, setAutoSave] = useState(false);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: "",
  });

  // --- Analysis Logic ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    try {
      setError("");
      setAnalyzing(true);

      const result = await analyzeLink(url);

      const newLink = {
        id: Date.now().toString(),
        url: result.url,
        domain: result.domain,
        summary: result.summary,
        keywords: result.keywords,
        wordCount: result.wordCount,
        sentiment: result.sentiment,
        analyzedAt: new Date().toLocaleString(),
      };

      setAnalyzedLinks([newLink, ...analyzedLinks]);
      setUrl("");

      // If auto-save is ON, we skip the modal and save directly
      if (autoSave) {
        await quickSave(newLink);
      }

      onLinkAnalyzed();
    } catch (err) {
      setError(`Failed to analyze URL: ${err.message || err}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // --- Quick Save (Auto-save) ---
  const quickSave = async (link) => {
    try {
      await invoke("add_note", {
        title: `Analysis: ${link.domain}`,
        content: `Source: ${link.url}\n\n## Summary\n${link.summary}\n\n## Keywords\n${link.keywords.join(", ")}\n\n## Sentiment\n${link.sentiment || "Neutral"}`,
        tags: ["gemini-analysis", link.domain, ...link.keywords.slice(0, 3)],
      });
      console.log("Auto-saved note");
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  // --- Manual Save (Opens Editor Modal) ---
  const openSaveModal = (link) => {
    setNoteForm({
      title: `Analysis: ${link.domain}`,
      content: `Source: ${link.url}\n\n## Summary\n${link.summary}\n\n## Keywords\n${link.keywords.join(", ")}\n\n## Sentiment\n${link.sentiment || "Neutral"}`,
      tags: ["gemini-analysis", link.domain, ...link.keywords].join(", "),
    });
    setShowModal(true);
  };

  const handleFinalSave = async () => {
    try {
      // Convert comma-separated string back to array for tags
      const tagArray = noteForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await invoke("add_note", {
        title: noteForm.title,
        content: noteForm.content,
        tags: tagArray,
      });

      alert("Note saved successfully!");
      setShowModal(false); // Close modal
      onLinkAnalyzed(); // Refresh sidebar/stats
    } catch (err) {
      alert("Failed to save note: " + err);
    }
  };

  const handleDelete = (id) => {
    setAnalyzedLinks(analyzedLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="links-tab section">
      {/* --- The Main Link Analyzer UI --- */}
      <div className="links-container">
        <div className="card form-card">
          <h3>Analyze a Link with Gemini</h3>
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

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  disabled={analyzing}
                />
                Skip editor (Auto-save immediately)
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze Link"}
              </button>
            </div>
          </form>
        </div>

        {/* --- List of Analyzed Links --- */}
        <div className="links-list">
          {analyzedLinks.map((link) => (
            <div key={link.id} className="card link-card">
              <div className="card-header">
                <div className="link-header-content">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-domain"
                  >
                    {link.domain}
                  </a>
                  <div className="card-meta">{link.analyzedAt}</div>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-small btn-secondary"
                    onClick={() => openSaveModal(link)}
                    title="Review & Save as Note"
                  >
                    📝 Save
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(link.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="link-summary">
                <p>{link.summary}</p>
              </div>
              <div className="link-keywords">
                {link.keywords.map((k, i) => (
                  <span key={i} className="tag tag-blue">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- EDIT MODAL (The "Editing Window") --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>Save Analysis as Note</h3>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, title: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                className="note-editor-textarea"
                rows="10"
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, content: e.target.value })
                }
              ></textarea>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={noteForm.tags}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, tags: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleFinalSave}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
