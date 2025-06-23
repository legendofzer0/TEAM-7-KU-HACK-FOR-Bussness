import { useState } from "react";
import UserIcon from "../assets/User.png";
import NewsIcon from "../assets/News.png";
import ContactIcon from "../assets/Contact.png";
import ProfileModal from "./Profile";
import ContactUsModal from "./ContactUs";

import "../css/sidebar.css";
import NewsModal from "./news";

interface NavItem {
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "User Profile", icon: UserIcon },
  { label: "News", icon: NewsIcon },
  { label: "Contact Us", icon: ContactIcon },
];

export default function Sidebar() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModel,setShowContactModel] = useState(false);
  const [showNewsModel,setShowNewsModel] = useState(false);


  const handleItemClick = (label: string) => {
    if (label === "User Profile") {
      setShowProfileModal(true);
    }
    if(label === "Contact Us"){
      setShowContactModel(true);
    }
    if(label === "News"){
      setShowNewsModel(true);
    }
  };

  return (
    <>
      <div className="sidebar">
        {navItems.map((item) => (
          <div
            className="sidebar-item"
            key={item.label}
            onClick={() => handleItemClick(item.label)}
          >
            <img src={item.icon} alt={item.label} className="sidebar-icon" />
            <div className="tooltip">{item.label}</div>
          </div>
        ))}
      </div>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
      {
        showContactModel && (
          <ContactUsModal onClose={()=>setShowContactModel(false)} />
        )
      }
      {
        showNewsModel && (
          <NewsModal onClose={()=>setShowNewsModel(false)} />
        )
      }
    </>
  );
}
