import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebase";
import LoginSignup from "./components/LoginSignUp";
import Mainpage from "./mainpage";

interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const t = await user.getIdToken();
        setToken(t);
      } else {
        setToken(null);
      }
    });
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !token) return;

    const userMsg = input.trim();
    try {
      const res = await axios.post(
        "http://localhost:8000/chat/",
        { message: userMsg },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) => [
        ...prev,
        { from: "user", text: userMsg },
        { from: "bot", text: res.data.response },
      ]);
      setInput("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Chat failed.");
    }
  };

  return (
      <>
      <div>
          {!token ? (
            <LoginSignup onAuth={setToken} />
          ) : (
            <>
              <Mainpage />
            </>)
          }
        </div>
    </>
  );
}

export default App;
