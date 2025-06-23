import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase"; // Adjust this path if needed
import axios from "axios";
import toast from "react-hot-toast";

import "../css/NotificationButton.css";
import bellIcon from "../assets/Notification.png";
import bellActiveIcon from "../assets/Notification_active.png";

import { get, child } from "firebase/database";

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

useEffect(() => {
  const sensorRef = ref(db, "Sensors");

  const unsubscribe = onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Filter out messages that already exist in notifications
    const newMessages = Object.entries(data)
      .map(([sensorType, value]) => `${sensorType} sensor value changed to ${value}`)
      .filter((msg) => !notifications.some((n) => n.message === msg));

    if (newMessages.length === 0) return; // no new notifications

    // Update notifications state once with all new messages
    setNotifications((prev) => {
      const newNotifications = newMessages.map((msg) => ({
        id: Date.now().toString() + Math.random(), // unique id
        message: msg,
        read: false,
      }));
      return [...newNotifications, ...prev];
    });

    // Show one combined critical toast
    const combinedMessage = newMessages.join("\n");
    toast.error(combinedMessage);

    // Send each event to backend
    newMessages.forEach((msg) => {
      const [sensorType, , , , value] = msg.split(" ");
      axios.post("http://localhost:8000/sensor-event", {
        sensor_type: sensorType,
        value: value,
      }).catch(console.error);
    });
  });

  return () => unsubscribe();
}, [notifications]); // add notifications to dependency to access latest in filter


  const unread = notifications.some((n) => !n.read);

  const toggleModal = () => {
    if (!modalOpen) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
    setModalOpen((prev) => !prev);
  };
  console.log("NotificationButton component loaded");

  return (
    <div className="notification-wrapper">
      <img
        src={unread ? bellActiveIcon : bellIcon}
        alt="Notifications"
        className="notification-icon"
        onClick={toggleModal}
      />

      {modalOpen && (
        <div className="notification-modal">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? "read" : "unread"}>
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
