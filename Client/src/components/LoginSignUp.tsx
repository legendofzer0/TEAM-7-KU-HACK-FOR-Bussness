import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";

interface Props {
  onAuth: (token: string) => void;
}

export default function LoginSignup({ onAuth }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string): boolean =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$%!])[A-Za-z\d@$%!]{6,}$/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 symbol (@$%!)");
      return;
    }

    try {
      const userCred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      const token = await userCred.user.getIdToken();
      onAuth(token);
      toast.success(isLogin ? "Login successful" : "Account created successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Authentication failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>

      <p
        onClick={() => setIsLogin(!isLogin)}
        style={{ color: "blue", cursor: "pointer" }}
      >
        {isLogin ? "Create an account" : "Already have one? Log in"}
      </p>
    </form>
  );
}
