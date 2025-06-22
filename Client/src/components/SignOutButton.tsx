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
    <button onClick={handleSignOut} className="signout-btn">
      Sign Out
    </button>
  );
}
