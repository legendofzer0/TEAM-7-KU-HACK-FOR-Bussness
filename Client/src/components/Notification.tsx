import { useState, useEffect } from "react";
import "../css/NotificationButton.css";

import bellIcon from  "../assets/Notification.png"
import bellActiveIcon from "../assets/Notification_active.png";

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  { id: "1", message: "Fan turned ON", read: false },
  { id: "2", message: "Meeting Room light turned OFF", read: false },
];

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Replace with Firebase call if needed
    setNotifications(dummyNotifications);
  }, []);

  const unread = notifications.some((n) => !n.read);

  const toggleModal = () => {
    if (!modalOpen) {
      // Mark all as read
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
