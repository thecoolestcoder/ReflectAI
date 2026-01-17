import { useState } from "react";
import "../styles/HistoryTab.css";

export default function HistoryTab({ notes }) {
  const [filterTag, setFilterTag] = useState("");

  // Sort notes by creation date (most recent first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap((note) => note.tags))];

  // Filter notes by tag
  const filteredNotes = filterTag
    ? sortedNotes.filter((note) => note.tags.includes(filterTag))
    : sortedNotes;

  // Group notes by date
  const groupedByDate = filteredNotes.reduce((acc, note) => {
    const date = new Date(note.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(note);
    return acc;
  }, {});

  return (
    <div className="history-tab section">
      <div className="history-header">
        <h2>History & Timeline</h2>
        <p>View all your notes organized by date</p>
      </div>

      {allTags.length > 0 && (
        <div className="filter-section">
          <h3>Filter by Tag</h3>
          <div className="filter-tags">
            <button
              className={`filter-btn ${!filterTag ? "active" : ""}`}
              onClick={() => setFilterTag("")}
            >
              All Notes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`filter-btn ${filterTag === tag ? "active" : ""}`}
                onClick={() => setFilterTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-title">No history yet</div>
          <div className="empty-state-description">
            Your notes will appear here as you create them
          </div>
        </div>
      ) : (
        <div className="timeline">
          {Object.entries(groupedByDate).map(([date, dateNotes]) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">
                <div className="timeline-dot"></div>
                <div className="timeline-label">{date}</div>
              </div>

              <div className="timeline-items">
                {dateNotes.map((note) => (
                  <div key={note.id} className="timeline-item">
                    <div className="item-header">
                      <h4 className="item-title">{note.title}</h4>
                      <span className="item-time">
                        {new Date(note.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="item-content">
                      {note.content.substring(0, 200)}
                      {note.content.length > 200 ? "..." : ""}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="item-tags">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="tag tag-small"
                            onClick={() => setFilterTag(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {note.source && (
                      <div className="item-source">
                        <small>📌 Source: {note.source}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="history-stats">
        <div className="stat-box">
          <div className="stat-number">{notes.length}</div>
          <div className="stat-label">Total Notes</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{allTags.length}</div>
          <div className="stat-label">Tags Used</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">
            {notes.reduce((sum, note) => sum + note.content.length, 0)}
          </div>
          <div className="stat-label">Total Characters</div>
        </div>
      </div>
    </div>
  );
}
