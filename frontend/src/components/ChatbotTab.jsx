import { useState, useRef, useEffect } from "react";
import { askAI } from "../services/ai"; // Ensure this path matches where you created the service file
import "../styles/ChatbotTab.css";

export default function ChatbotTab({ notes }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant powered by Gemini. I can read your notes to answer questions, summarize content, or find connections. How can I help you today?",
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 1. Create User Message Object
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    // 2. Update State and Clear Input
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // 3. Call the Gemini Service
      // We pass the user's question AND the full notes array
      const aiResponseText = await askAI(inputValue, notes);

      // 4. Create Bot Response Object
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorResponse = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "I'm having trouble reaching the AI right now. Please check your internet connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear all messages?")) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content:
            "Chat history cleared. I'm ready to help you analyze your notes again!",
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Helper to handle suggestion clicks
  const handleSuggestionClick = (question) => {
    // We set the input value, but we also want to trigger the send immediately?
    // Usually easier to just set input and let user hit send, or call a send function manually.
    // Here we will just set the input to let the user review it first.
    setInputValue(question);
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
            <div key={message.id} className={`message message-${message.type}`}>
              <div className="message-avatar">
                {message.type === "bot" ? "🤖" : "👤"}
              </div>
              <div className="message-content">
                <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
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
              {loading ? "..." : "Send"}
            </button>
          </div>
        </form>

        <div className="chatbot-suggestions">
          <div className="suggestions-label">Quick Questions:</div>
          <div className="suggestions-grid">
            <button
              className="suggestion-btn"
              onClick={() =>
                handleSuggestionClick("Summarize my recent notes about Rust")
              }
            >
              Summarize Rust notes
            </button>
            <button
              className="suggestion-btn"
              onClick={() =>
                handleSuggestionClick("What tags am I using the most?")
              }
            >
              Analyze my tags
            </button>
            <button
              className="suggestion-btn"
              onClick={() =>
                handleSuggestionClick("Find any contradictions in my notes")
              }
            >
              Find contradictions
            </button>
            <button
              className="suggestion-btn"
              onClick={() =>
                handleSuggestionClick("Create a study guide based on my notes")
              }
            >
              Create study guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
