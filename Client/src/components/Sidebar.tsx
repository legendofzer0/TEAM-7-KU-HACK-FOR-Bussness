import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

interface NavItem {
  label: string;
  path: string;
  icon: string; // relative path to asset
}

const navItems: NavItem[] = [
  { label: "User Profile", path: "/profile", icon: "../assets/profile.png" },
  { label: "Chat History", path: "/history", icon: "../assets/chat.png" },
  { label: "News", path: "/news", icon: "../assets/news.png" },
  { label: "Photo Upload", path: "/upload", icon: "../assets/upload.png" },
  { label: "Contact Us", path: "/contact", icon: "../assets/contact.png" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      {navItems.map((item) => (
        <div
          className="sidebar-item"
          key={item.label}
          onClick={() => navigate(item.path)}
        >
          <img src={item.icon} alt={item.label} className="sidebar-icon" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
