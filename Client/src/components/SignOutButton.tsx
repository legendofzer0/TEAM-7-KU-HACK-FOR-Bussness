import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      window.location.reload(); // or redirect to login
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <button onClick={handleSignOut} style={{
    backgroundColor: "#e53935",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(229, 57, 53, 0.4)",
    transition: "background-color 0.3s ease",
  }}
  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b71c1c")}
  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#e53935")}
  onMouseDown={e => {
    e.currentTarget.style.backgroundColor = "#7f0000";
    e.currentTarget.style.boxShadow = "none";
  }}
  onMouseUp={e => {
    e.currentTarget.style.backgroundColor = "#b71c1c";
    e.currentTarget.style.boxShadow = "0 2px 5px rgba(229, 57, 53, 0.4)";
  }}>
      Sign Out
    </button>
  );
}
