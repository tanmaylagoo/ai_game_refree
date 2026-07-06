import React from "react";
import { PlusIcon, MicIcon } from "../Common/Icons";
import "./SearchBar.css";

const SearchBar = () => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-container glass-panel">
        {/* Modern traveling neon border track */}
        <div className="search-bar-border"></div>

        <button className="search-bar-btn plus-btn" aria-label="Add file or context">
          <PlusIcon size={18} />
        </button>
        
        <input 
          type="text" 
          className="search-bar-input" 
          placeholder="Ask anything about game rules, legal moves, strategy..." 
        />
        
        <button className="search-bar-btn mic-btn" aria-label="Voice input">
          <MicIcon size={18} />
        </button>
      </div>
      <div className="search-bar-subtext">
        Press <kbd className="kbd-shortcut">Enter</kbd> to query Ref AI
      </div>
    </div>
  );
};

export default SearchBar;
