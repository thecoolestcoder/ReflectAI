import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../styles/LinksTab.css";

export default function LinksTab({ onLinkAnalyzed }) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedLinks, setAnalyzedLinks] = useState([]);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    try {
      setError("");
      setAnalyzing(true);

      const result = await invoke("analyze_url", { url });

      setAnalyzedLinks([
        {
          id: Date.now().toString(),
          url: result.url,
          domain: result.domain,
          summary: result.summary,
          keywords: result.keywords,
          wordCount: result.word_count,
          analyzedAt: new Date().toLocaleString(),
        },
        ...analyzedLinks,
      ]);

      setUrl("");
      onLinkAnalyzed();
    } catch (err) {
      setError(`Failed to analyze URL: ${err}`);
      console.error("Error analyzing URL:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAsNote = async (link) => {
    try {
      await invoke("add_note", {
        title: `Article: ${link.domain}`,
        content: `URL: ${link.url}\n\n${link.summary}\n\nKeywords: ${link.keywords.join(", ")}`,
        tags: ["link", link.domain, ...link.keywords.slice(0, 3)],
      });
      alert("Saved as note!");
      onLinkAnalyzed();
    } catch (err) {
      alert("Failed to save as note");
      console.error("Error:", err);
    }
  };

  const handleDelete = (id) => {
    setAnalyzedLinks(analyzedLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="links-tab section">
      <div className="links-container">
        <div className="card form-card">
          <h3>Analyze a Link</h3>
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
                {analyzing ? "Analyzing..." : "Analyze Link"}
              </button>
            </div>
          </form>
        </div>

        {analyzedLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div className="empty-state-title">No links analyzed yet</div>
            <div className="empty-state-description">
              Enter a URL above to analyze and extract insights
            </div>
          </div>
        ) : (
          <div className="links-list">
            <h3>Analyzed Links</h3>
            {analyzedLinks.map((link) => (
              <div key={link.id} className="card link-card">
                <div className="card-header">
                  <div className="link-header-content">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-domain"
                    >
                      {link.domain}
                    </a>
                    <div className="card-meta">{link.analyzedAt}</div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => handleSaveAsNote(link)}
                      title="Save as note"
                    >
                      💾
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
                  <h4>Summary</h4>
                  <p>{link.summary}</p>
                </div>

                <div className="link-keywords">
                  <h4>Key Terms</h4>
                  <div className="keywords-container">
                    {link.keywords.map((keyword) => (
                      <span key={keyword} className="tag tag-blue">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="link-stats">
                  <span className="stat">📊 {link.wordCount} words</span>
                </div>

                <div className="link-url">
                  <small>{link.url}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
