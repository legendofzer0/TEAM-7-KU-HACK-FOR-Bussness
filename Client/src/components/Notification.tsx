import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase"; // adjust path if needed
import axios from "axios";

import "../css/NotificationButton.css";
import bellIcon from "../assets/Notification.png";
import bellActiveIcon from "../assets/Notification_active.png";

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

      Object.entries(data).forEach(([sensorType, value]) => {
        const newMessage = `${sensorType} sensor value changed to ${value}`;

        const newNotification: Notification = {
          id: Date.now().toString(),
          message: newMessage,
          read: false,
        };

        // Avoid duplicates
        setNotifications((prev) => {
          if (prev.some((n) => n.message === newMessage)) return prev;
          return [newNotification, ...prev];
        });

        // Send to backend
        axios.post("http://localhost:8000/sensor-event", {
          sensor_type: sensorType,
          value: value.toString(),
        }).catch(console.error);
      });
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  const unread = notifications.some((n) => !n.read);

  const toggleModal = () => {
    if (!modalOpen) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
    setModalOpen((prev) => !prev);
  };

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
