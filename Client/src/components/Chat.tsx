import { useRef, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
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
  const [chating, setChating] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      console.log("Transcript:", transcript);
    }
  }, [transcript]);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    toast.success("Voice recognition started");
  };

  const stopListeningAndSend = async () => {
    SpeechRecognition.stopListening();

    if (!message.trim()) {
      toast.error("No message to send");
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

      setChating(true);
      setResponse(data.response);
      setRequest(message);
      setMessage("");
      resetTranscript();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to get response from JARVIS"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (listening) {
      await stopListeningAndSend();
      return;
    }

    if (!message.trim()) {
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

      setChating(true);
      setResponse(data.response);
      setRequest(message);
      setMessage("");
      resetTranscript();
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

      <div>
        {!chating ? (
          <img src={Background} className="background_img" />
        ) : (
          <ChatTemplate request={request} response={response} />
        )}
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
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          className="chat-send-button"
          disabled={loading}
        >
          {loading ? "..." : "➤"}
        </button>
        <button
          onClick={listening ? stopListeningAndSend : startListening}
          style={{
            margin: "10px",
            padding: "8px 16px",
            backgroundColor: listening ? "#e53935" : "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {listening ? "Stop & Send 🎙️" : "Start Recording 🎤"}
        </button>
      </div>
    </div>
  );
}
