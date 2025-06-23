import { useState } from "react";
import "../css/ContactUsModal.css";
import axios from "axios";
import toast from "react-hot-toast";

interface ContactUsModalProps {
  onClose: () => void;
}

export default function ContactUsModal({ onClose }: ContactUsModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim() || !email.trim() || !message.trim()) {
    setError("Please fill in all fields.");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    const payload = {
      name,
      email,
      message,
    };

    await axios.post("http://127.0.0.1:8000/contact/", payload);
    toast.success("Message sent successfully!");
    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");
  } catch (err) {
    toast.error("Failed to send message. Please try again later.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing modal when clicking inside
      >
        <h2>Contact Us <button className="close-btn" onClick={onClose}>×</button></h2>

        {success ? (
          <p className="success-message">Thank you! Your message has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            {error && <p className="error-message">{error}</p>}

            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </label>

            <label>
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                required
                rows={5}
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
