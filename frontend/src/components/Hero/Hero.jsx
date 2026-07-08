import React from "react";
import Orb from "../Orb/Orb";
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero-container">
      <header className="main-header">
        <h1 className="greeting-title">Hello, Player <span className="hand-wave">👋</span></h1>
        <p className="greeting-subtitle">
          Ask anything about game rules, legal moves, move validation or strategy.
        </p>
      </header>

      {/* AI Orb Centerpiece Section */}
      <section className="orb-section">
        <Orb />
      </section>
    </div>
  );
};

export default Hero;
