import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";
import toast from "react-hot-toast";
import ChatTemplate from "./ChatTemplate";
import "../css/Chat.css";

interface ChatMessage {
  id: number;
  sender_uid: string;
  message: string;
  response: string | null;
  timestamp: string;
}

interface ChatRecordResponse {
  id: string;
  name: string;
  messages: ChatMessage[];
}

export default function ChatWindow() {
  const { chat_record_id: chatRecordIdParam } = useParams<{ chat_record_id: string }>();
  const navigate = useNavigate();

  // Track current chat record id in state
  const [chatRecordId, setChatRecordId] = useState<string | undefined>(chatRecordIdParam);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input state and textarea ref for auto-resize
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync chatRecordId state when URL param changes (e.g. on manual navigation)
  useEffect(() => {
    setChatRecordId(chatRecordIdParam);
  }, [chatRecordIdParam]);

  // Fetch messages whenever chatRecordId changes
  useEffect(() => {
    if (!chatRecordId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError("Not authenticated");
          return;
        }

        const token = await user.getIdToken();

        const { data } = await axios.get<ChatRecordResponse>(
          `http://localhost:8000/chat/${chatRecordId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages(data.messages);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch chat messages");
        toast.error(error || "Failed to fetch chat messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatRecordId]);

  // Auto-resize textarea on input change
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const maxHeight = window.innerHeight * 0.5;
      const scrollHeight = el.scrollHeight;
      el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [input]);

  // Send a message to backend
  const sendMessage = async () => {
    console.log("sendMessage called"); 
    if (!input.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      // Prepare post data conditionally including chat_record_id only if it exists
      const postData: { message: string; chat_record_id?: string } = { message: input };
      if (chatRecordId) {
        postData.chat_record_id = chatRecordId;
      }

      // DEBUG: Log payload before sending
      console.log("Sending payload:", postData);

      const { data } = await axios.post(
        "http://localhost:8000/chat/",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If backend created a new chat record, update state and URL
      if (data.chat_record_id && data.chat_record_id !== chatRecordId) {
        setChatRecordId(data.chat_record_id);
        navigate(`/c/${data.chat_record_id}`);
      }
      // Otherwise just reload messages
      else {
        const refreshed = await axios.get<ChatRecordResponse>(
          `http://localhost:8000/chat/${chatRecordId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(refreshed.data.messages);
      }

      setInput("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Reset chat for new session
  const startNewChat = () => {
    setChatRecordId(undefined);
    setMessages([]);
    setInput("");
    navigate("/"); // Navigate to home or wherever you want for new chat
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-window">
        <h2>Chat</h2>
        <button onClick={startNewChat} style={{ marginBottom: 10 }}>
          + New Chat
        </button>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {messages.length === 0 && !loading && <p>No messages yet.</p>}

        {messages.map((msg) => (
          <ChatTemplate
            key={msg.id}
            request={msg.message}
            response={msg.response || ""}
          />
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          className="chat-textarea"
          rows={1}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="chat-send-button"
          disabled={loading}
        >
          {loading ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}
