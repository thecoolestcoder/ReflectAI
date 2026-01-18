import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MDEditor from "@uiw/react-md-editor";
import {
  Eye,
  Edit2,
  Trash2,
  X,
  Plus,
  FileText,
  Search,
  Link2,
  ChevronDown,
} from "lucide-react";
import { analyzeLink } from "../services/linkAnalyzer";
import "../styles/NotesTab.css";

export default function NotesTab({ notes, onNoteAdded, onNoteDeleted }) {
  const [showForm, setShowForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Note Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Link Analyzer State
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [linkError, setLinkError] = useState("");

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTagKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, "");
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalTags = [...tags];
      if (tagInput.trim()) {
        finalTags.push(tagInput.trim());
      }

      if (editingId) {
        await invoke("update_note", {
          id: editingId,
          title,
          content,
          tags: finalTags,
        });
      } else {
        await invoke("add_note", {
          title,
          content,
          tags: finalTags,
        });
      }

      resetForm();
      onNoteAdded();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    }
  };

  const handleLinkAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setLinkError("Please enter a URL");
      return;
    }

    try {
      setLinkError("");
      setAnalyzing(true);

      const result = await analyzeLink(url);

      await invoke("add_note", {
        title: `Analysis: ${result.domain}`,
        content: `Source: ${result.url}\n\n## Summary\n${result.summary}\n\n## Keywords\n${result.keywords.join(", ")}\n\n## Sentiment\n${result.sentiment || "Neutral"}`,
        tags: [
          "gemini-analysis",
          result.domain,
          ...result.keywords.slice(0, 3),
        ],
      });

      setUrl("");
      setShowLinkForm(false);
      onNoteAdded();
      alert("Link analyzed and saved successfully!");
    } catch (err) {
      setLinkError(`Analysis failed: ${err.message || err}`);
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await invoke("delete_note", { id });
        onNoteDeleted();
        if (viewingNote && viewingNote.id === id) {
          setViewingNote(null);
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note");
      }
    }
  };

  const handleEdit = (note) => {
    setViewingNote(null);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setTagInput("");
    setEditingId(note.id);
    setShowForm(true);
    setShowLinkForm(false);
  };

  const handleView = (note) => {
    setShowForm(false);
    setShowLinkForm(false);
    setViewingNote(note);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setShowForm(false);
    setShowLinkForm(false);
    setEditingId(null);
    setViewingNote(null);
    setUrl("");
    setLinkError("");
  };

  return (
    <div className="notes-tab section">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Button */}
        <div className="dropdown-container">
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} /> New Note
          </button>
          <button
            className="btn-dropdown-toggle"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ChevronDown size={18} />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setShowDropdown(false);
                }}
              >
                <FileText size={16} /> New Note
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowLinkForm(true);
                  setShowDropdown(false);
                }}
              >
                <Link2 size={16} /> Analyze Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LINK ANALYZER FORM */}
      {showLinkForm && (
        <div className="card form-card">
          <h3>Analyze Link</h3>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              marginBottom: "1.5rem",
              fontSize: "14px",
            }}
          >
            Enter a URL below. The AI will analyze it and automatically save it
            as a note.
          </p>

          <form onSubmit={handleLinkAnalyze}>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={analyzing}
              />
            </div>

            {linkError && (
              <div
                style={{
                  color: "#fca5a5",
                  marginBottom: "1rem",
                  fontSize: "14px",
                }}
              >
                {linkError}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze & Save"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={analyzing}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW NOTE CARD */}
      {viewingNote && (
        <div className="card view-card">
          <div className="card-header">
            <h3>{viewingNote.title}</h3>
            <button className="btn-icon" onClick={resetForm} title="Close View">
              <X size={20} />
            </button>
          </div>

          <div className="view-content" style={{ margin: "1rem 0" }}>
            <MDEditor.Markdown
              source={viewingNote.content}
              style={{
                whiteSpace: "pre-wrap",
                backgroundColor: "transparent",
                color: "#fff",
              }}
            />
          </div>

          {viewingNote.tags && viewingNote.tags.length > 0 && (
            <div className="tags-container">
              {viewingNote.tags.map((tag) => (
                <span key={tag} className="tag tag-purple">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="card-meta">
            Created: {new Date(viewingNote.created_at).toLocaleString()}
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={resetForm}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT / CREATE FORM */}
      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? "Edit Note" : "Create New Note"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                required
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={300}
                preview="edit"
                hidePreview={true}
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-pill">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={
                    tags.length === 0 ? "Type comma to add tag..." : ""
                  }
                  className="tag-input-field"
                />
              </div>
              <small className="helper-text">
                Press comma (,) or Enter to add a tag.
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Note" : "Create Note"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTE LIST */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={64} strokeWidth={1} />
          </div>
          <div className="empty-state-title">No notes yet</div>
          <div className="empty-state-description">
            Create your first note to get started
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} /> Create Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note.id} className="card note-card">
              <div className="card-header">
                <h3 className="card-title">{note.title}</h3>
                <div className="card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleView(note)}
                    title="View Note"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(note)}
                    title="Edit Note"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(note.id)}
                    title="Delete Note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="note-content-preview">
                <MDEditor.Markdown
                  source={note.content}
                  style={{ backgroundColor: "transparent", color: "inherit" }}
                />
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="tags-container">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag tag-purple">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-meta">
                Created: {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
