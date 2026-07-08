import React, { useState } from "react";
import {
  LogoIcon,
  NewChatIcon,
  ChatsIcon,
  LibraryIcon,
  GamesIcon,
  SettingsIcon,
  MoreIcon,
  ChevronDownIcon,
} from "../Common/Icons";
import "./Sidebar.css";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("New Chat");
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainMenuItems = [
    { name: "New Chat", icon: NewChatIcon },
    { name: "Chats", icon: ChatsIcon },
    { name: "Rules Library", icon: LibraryIcon },
    { name: "Settings", icon: SettingsIcon },
  ];

  const moreSubItems = [
    { name: "Explain Rules", icon: LibraryIcon },
    { name: "Check Move", icon: ChatsIcon },
    { name: "Game Strategy", icon: SettingsIcon },
    { name: "Supported Games", icon: GamesIcon },
  ];

  const handleItemClick = (name) => {
    setActiveItem(name);
  };

  const toggleMoreMenu = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-header">
        <LogoIcon className="sidebar-logo" size={32} />
        <div className="sidebar-title-container">
          <span className="sidebar-title">AI Game Referee</span>
          <span className="sidebar-subtitle-tag">V1.0.0</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Main navigation list */}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          return (
            <button
              key={item.name}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleItemClick(item.name)}
            >
              <Icon className="sidebar-icon" size={20} />
              <span className="sidebar-nav-text">{item.name}</span>
            </button>
          );
        })}

        {/* Expandable "More" dropdown item */}
        <div className="sidebar-dropdown-wrapper">
          <button
            className={`sidebar-nav-item dropdown-toggle ${isMoreOpen ? "expanded" : ""}`}
            onClick={toggleMoreMenu}
          >
            <MoreIcon className="sidebar-icon" size={20} />
            <span className="sidebar-nav-text">More</span>
            <ChevronDownIcon className={`chevron-indicator ${isMoreOpen ? "rotated" : ""}`} size={16} />
          </button>

          {/* Expandable sub-nav panel */}
          <div className={`sidebar-sub-nav ${isMoreOpen ? "open" : ""}`}>
            {moreSubItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive = activeItem === subItem.name;
              return (
                <button
                  key={subItem.name}
                  className={`sidebar-sub-nav-item ${isSubActive ? "active" : ""}`}
                  onClick={() => handleItemClick(subItem.name)}
                >
                  <SubIcon className="sidebar-sub-icon" size={16} />
                  <span className="sidebar-sub-text">{subItem.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
