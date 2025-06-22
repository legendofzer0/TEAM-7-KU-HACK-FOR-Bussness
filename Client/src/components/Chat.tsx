import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import "../css/Chat.css";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Type something...");
      return;
    }

    setLoading(true);
    try {
      // Simulate bot reply
      const reply = `${message}`;
      await new Promise((res) => setTimeout(res, 800));
      setResponse(reply);
      setMessage(""); // Clear after send
    } catch (err) {
      toast.error("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const scrollHeight = el.scrollHeight;
      const maxHeight = window.innerHeight * 0.5;
      el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [message]);

  return (
    <div className="chat-wrapper">
      <div className="chat-window">
        <h2>JARVIS</h2>
        {response && <div className="chat-response">{response}</div>}
      </div>

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="chat-textarea"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          className="chat-send-button"
          disabled={loading}
        >
          {loading ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}
