import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import NotesTab from "./components/NotesTab";
import LinksTab from "./components/LinksTab";
import HistoryTab from "./components/HistoryTab";
import ChatbotTab from "./components/ChatbotTab";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const result = await invoke("get_notes");
      setNotes(result);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteAdded = () => {
    loadNotes();
  };

  const handleNoteDeleted = () => {
    loadNotes();
  };

  // --- FIXED FUNCTION ---
  const handleSaveAiNote = async (newNote) => {
    try {
      // FIX: Changed "create_note" to "add_note" to match your Rust backend
      await invoke("add_note", {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
      });

      await loadNotes();

      // Optional: Ask user if they want to switch to the notes tab
      if (confirm("Note saved! Go to Notes tab to see it?")) {
        setActiveTab("notes");
      }
    } catch (error) {
      console.error("Failed to save AI note:", error);
      alert("Failed to save note: " + error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ReflectAI</h1>
        <p>Your AI-powered reflection and knowledge management tool</p>

        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            📝 Notes
          </button>
          <button
            className={`nav-btn ${activeTab === "links" ? "active" : ""}`}
            onClick={() => setActiveTab("links")}
          >
            🔗 Links
          </button>
          <button
            className={`nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📜 History
          </button>
          <button
            className={`nav-btn ${activeTab === "chatbot" ? "active" : ""}`}
            onClick={() => setActiveTab("chatbot")}
          >
            🤖 AI Assistant
          </button>
        </nav>
      </header>

      <main className="app-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === "notes" && (
              <NotesTab
                notes={notes}
                onNoteAdded={handleNoteAdded}
                onNoteDeleted={handleNoteDeleted}
              />
            )}

            {activeTab === "links" && (
              <LinksTab onLinkAnalyzed={handleNoteAdded} />
            )}

            {activeTab === "history" && <HistoryTab notes={notes} />}

            {activeTab === "chatbot" && (
              <ChatbotTab notes={notes} onSaveNote={handleSaveAiNote} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>ReflectAI v0.1.0 • Powered by Tauri 2.0</p>
      </footer>
    </div>
  );
}

export default App;
