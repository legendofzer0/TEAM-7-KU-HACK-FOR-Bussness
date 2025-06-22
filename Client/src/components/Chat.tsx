import { useRef, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";
import toast from "react-hot-toast";
import "../css/Chat.css";
import Background from "../assets/background.gif";
import ChatTemplate from "./ChatTemplate";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chating,setChating] = useState(false);

  const handleSubmit = async () => {
    console.log("Submits")
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      setChating(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const { data } = await axios.post(
        "http://localhost:8000/chat/",
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setResponse(data.response);
      setRequest(message);
      setMessage("");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to get response from JARVIS"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const maxHeight = window.innerHeight * 0.5;
      const scrollHeight = el.scrollHeight;
      el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [message]);

  return (
    <div className="chat-wrapper">
      <div className="chat-window center">
        <h1>JARVIS</h1>
      </div>
      <div> { !chating?
        <img src={Background} className="background_img"/>:
          <ChatTemplate request={request} response={response}/>
        }
      </div>
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="chat-textarea"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
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
