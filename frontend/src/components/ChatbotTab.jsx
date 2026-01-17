import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAI } from "../services/ai";
import "../styles/ChatbotTab.css";

export default function ChatbotTab({ notes, onSaveNote }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can analyze your notes, summarize content, or help you brainstorm. How can I help?",
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

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const aiResponseText = await askAI(inputValue, notes);

      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "Error: Could not reach AI.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = (content) => {
    const title = prompt("Enter a title for this new note:", "AI Insight");
    if (title && onSaveNote) {
      const newNote = {
        id: crypto.randomUUID(),
        title: title,
        content: content,
        tags: ["ai-generated"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSaveNote(newNote);
      alert("Note saved successfully!");
    } else if (!onSaveNote) {
      alert("Error: onSaveNote function was not passed to ChatbotTab.");
    }
  };

  return (
    <div className="chatbot-tab section">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h2>AI Assistant</h2>
          <div className="header-actions">
            <button
              className="btn-small btn-secondary"
              onClick={() => setMessages([])}
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message message-${message.type}`}>
              <div className="message-avatar">
                {message.type === "bot" ? "🤖" : "👤"}
              </div>

              <div className="message-content-wrapper">
                <div className="message-content markdown-body">
                  {/* The Markdown Component renders the text */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Only show Save button for Bot messages */}
                {message.type === "bot" && (
                  <div className="message-actions">
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      className="btn-save-note"
                      onClick={() => handleSaveResponse(message.content)}
                      title="Save as Note"
                    >
                      💾 Save as Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message message-bot">
              <div className="message-avatar">🤖</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
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
              placeholder="Ask me anything..."
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
      </div>
    </div>
  );
}
