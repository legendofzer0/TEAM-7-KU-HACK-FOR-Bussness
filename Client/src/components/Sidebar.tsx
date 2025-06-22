import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

import UserIcon from "../assets/User.png";
import NewsIcon from "../assets/News.png";
import ContactIcon from "../assets/Contact.png";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "User Profile", path: "/profile", icon: UserIcon },
  { label: "News", path: "/news", icon: NewsIcon },
  { label: "Contact Us", path: "/contact", icon: ContactIcon },
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
          <div className="tooltip">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
