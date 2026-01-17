import { useState, useRef, useEffect } from "react";
import "../styles/ChatbotTab.css";

export default function ChatbotTab({ notes }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can help you analyze your notes, answer questions, and provide insights. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    const noteCount = notes.length;
    const totalWords = notes.reduce(
      (sum, note) => sum + note.content.split(" ").length,
      0
    );
    const allTags = [...new Set(notes.flatMap((note) => note.tags))];

    // Simple keyword-based responses
    if (
      message.includes("how many") ||
      message.includes("total") ||
      message.includes("count")
    ) {
      if (message.includes("note")) {
        return `You have created ${noteCount} note${noteCount !== 1 ? "s" : ""} so far.`;
      }
      if (message.includes("tag") || message.includes("category")) {
        return `You're using ${allTags.length} different tag${allTags.length !== 1 ? "s" : ""}: ${allTags.join(", ") || "none yet"}`;
      }
      if (message.includes("word")) {
        return `Your notes contain approximately ${totalWords} words in total.`;
      }
    }

    if (
      message.includes("summarize") ||
      message.includes("summary") ||
      message.includes("overview")
    ) {
      if (noteCount === 0) {
        return "You haven't created any notes yet. Start by creating your first note!";
      }
      return `You have ${noteCount} notes with ${allTags.length} tags. Your notes contain about ${totalWords} words. Keep adding more to build a comprehensive knowledge base!`;
    }

    if (
      message.includes("recent") ||
      message.includes("latest") ||
      message.includes("newest")
    ) {
      if (noteCount === 0) {
        return "You don't have any notes yet.";
      }
      const recentNote = notes[notes.length - 1];
      return `Your most recent note is "${recentNote.title}" created on ${new Date(recentNote.created_at).toLocaleDateString()}.`;
    }

    if (
      message.includes("help") ||
      message.includes("what can") ||
      message.includes("how do")
    ) {
      return "I can help you with:\n• Summarizing your notes\n• Analyzing note statistics\n• Finding specific notes\n• Providing writing suggestions\n• Organizing by tags\n\nJust ask me anything about your notes!";
    }

    if (
      message.includes("recommend") ||
      message.includes("suggest") ||
      message.includes("advice")
    ) {
      if (noteCount < 5) {
        return "I recommend starting to organize your notes with consistent tags. This will help you find and categorize information more easily!";
      }
      if (allTags.length < 3) {
        return "Consider using more diverse tags to better organize your notes across different categories.";
      }
      return "Great job organizing your notes! Keep writing and adding to your knowledge base.";
    }

    if (message.includes("tag") || message.includes("categor")) {
      if (allTags.length === 0) {
        return "You haven't used any tags yet. Tags help organize your notes by category!";
      }
      return `Your tags: ${allTags.join(", ")}. These help you organize and find notes quickly.`;
    }

    if (message.includes("search") || message.includes("find")) {
      return "You can search your notes using the search bar in the Notes tab. It searches through titles, content, and tags!";
    }

    if (
      message.includes("export") ||
      message.includes("backup") ||
      message.includes("save")
    ) {
      return "You can export your notes from the Notes tab. This creates a backup of all your notes in JSON format.";
    }

    if (
      message.includes("analyze") ||
      message.includes("link") ||
      message.includes("url")
    ) {
      return "Great question! You can use the Links tab to analyze any webpage. Just paste a URL and I'll extract key information and keywords for you.";
    }

    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      return `Hello! 👋 I can see you have ${noteCount} notes. How can I help you today?`;
    }

    // Default response
    return "That's an interesting question! I can help you manage and analyze your notes. Try asking me about your notes, statistics, tags, or how to use the app.";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: generateBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 500);
  };

  const handleClearChat = () => {
    if (confirm("Clear all messages?")) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content:
            "Hello! I'm your AI assistant. I can help you analyze your notes, answer questions, and provide insights. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="chatbot-tab section">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h2>AI Assistant</h2>
          <p>Ask me anything about your notes</p>
          <button className="btn-small btn-secondary" onClick={handleClearChat}>
            Clear Chat
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message message-${message.type}`}
            >
              <div className="message-avatar">
                {message.type === "bot" ? "🤖" : "👤"}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chatbot-input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your notes..."
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={loading || !inputValue.trim()}
            >
              Send
            </button>
          </div>
        </form>

        <div className="chatbot-suggestions">
          <div className="suggestions-label">Quick Questions:</div>
          <div className="suggestions-grid">
            <button
              className="suggestion-btn"
              onClick={() => {
                setInputValue("How many notes do I have?");
              }}
            >
              How many notes?
            </button>
            <button
              className="suggestion-btn"
              onClick={() => {
                setInputValue("What tags am I using?");
              }}
            >
              My tags
            </button>
            <button
              className="suggestion-btn"
              onClick={() => {
                setInputValue("Summarize my notes");
              }}
            >
              Summarize
            </button>
            <button
              className="suggestion-btn"
              onClick={() => {
                setInputValue("What can you help me with?");
              }}
            >
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
