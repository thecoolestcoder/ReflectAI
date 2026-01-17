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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ReflectAI</h1>
        <p>Your AI-powered reflection and knowledge management tool</p>
      </header>

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
          🤖 Chatbot
        </button>
      </nav>

      <main className="app-content">
        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === "notes" && (
          <NotesTab
            notes={notes}
            onNoteAdded={handleNoteAdded}
            onNoteDeleted={handleNoteDeleted}
          />
        )}

        {!loading && activeTab === "links" && (
          <LinksTab onLinkAnalyzed={handleNoteAdded} />
        )}

        {!loading && activeTab === "history" && <HistoryTab notes={notes} />}

        {!loading && activeTab === "chatbot" && <ChatbotTab notes={notes} />}
      </main>

      <footer className="app-footer">
        <p>ReflectAI v0.1.0 • Powered by Tauri & React</p>
      </footer>
    </div>
  );
}

export default App;
