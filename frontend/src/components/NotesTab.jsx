import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../styles/NotesTab.css";

export default function NotesTab({ notes, onNoteAdded, onNoteDeleted }) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      if (editingId) {
        await invoke("update_note", {
          id: editingId,
          title: formData.title,
          content: formData.content,
          tags,
        });
      } else {
        await invoke("add_note", {
          title: formData.title,
          content: formData.content,
          tags,
        });
      }

      setFormData({ title: "", content: "", tags: "" });
      setShowForm(false);
      setEditingId(null);
      onNoteAdded();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await invoke("delete_note", { id });
        onNoteDeleted();
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note");
      }
    }
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setEditingId(note.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", tags: "" });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="notes-tab section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
        >
          + New Note
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? "Edit Note" : "Create New Note"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Note title"
                required
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your note here..."
                rows={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="e.g., important, work, ideas"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Note" : "Create Note"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No notes yet</div>
          <div className="empty-state-description">
            Create your first note to get started
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
          >
            Create Note
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
                    className="btn-small btn-secondary"
                    onClick={() => handleEdit(note)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(note.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="note-content">
                {note.content.substring(0, 150)}...
              </p>

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
