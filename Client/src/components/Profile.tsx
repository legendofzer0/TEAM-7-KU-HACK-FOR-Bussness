import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import "../css/ProfileModal.css"; // create this CSS for modal styles
import SignOutButton from "./SignOutButton";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        <h2>User Profile <button  onClick={onClose}>X</button></h2>
        <p>Email: {email ?? "Not logged in"}</p>
        <SignOutButton/>
      </div>
    </div>
  );
}
