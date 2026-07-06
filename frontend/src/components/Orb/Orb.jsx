import React, { useState, useEffect } from "react";
import "./Orb.css";

const Orb = () => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random natural blinking interval controller (2 to 6 seconds)
  useEffect(() => {
    let blinkTimeout;
    let openTimeout;

    const triggerBlink = () => {
      const nextDelay = Math.random() * 4000 + 2000; // random delay 2s to 6s
      
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        
        openTimeout = setTimeout(() => {
          setIsBlinking(false);
          triggerBlink(); // recursively schedule next blink
        }, 180); // blink duration (closing + opening transition)
      }, nextDelay);
    };

    triggerBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
    };
  }, []);

  // Static surrounding particles for atmosphere
  const particles = [
    { top: "15%", left: "20%", size: "4px", color: "rgba(168, 85, 247, 0.6)" },
    { top: "80%", left: "15%", size: "3px", color: "rgba(59, 130, 246, 0.5)" },
    { top: "25%", left: "75%", size: "5px", color: "rgba(236, 72, 153, 0.6)" },
    { top: "70%", left: "80%", size: "3px", color: "rgba(168, 85, 247, 0.4)" },
    { top: "10%", left: "55%", size: "2px", color: "rgba(255, 255, 255, 0.7)" },
    { top: "90%", left: "45%", size: "4px", color: "rgba(59, 130, 246, 0.6)" },
  ];

  return (
    <div className="ai-orb-wrapper">
      {/* Ambient background bloom backing */}
      <div className="ai-orb-glow"></div>

      {/* Scattered atmospheric particles */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          className="ai-orb-particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      {/* Outer orbit rings */}
      <div className="ai-orb-outer-ring"></div>

      {/* Synced projector shadow underneath the mascot */}
      <div className="ai-orb-shadow"></div>

      {/* Glass Sphere AI Mascot Sphere */}
      <div className="ai-orb-sphere">
        {/* Glowing Smiling Eyes (blinks randomly) */}
        <div className={`ai-orb-eyes-container ${isBlinking ? "is-blinking" : ""}`}>
          <svg className="ai-orb-eyes-svg" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
            {/* Left Eye Arc */}
            <path
              d="M 16 22 Q 30 7 44 22"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Right Eye Arc */}
            <path
              d="M 56 22 Q 70 7 84 22"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Glossy glass reflection overlay */}
        <div className="ai-orb-reflection"></div>
      </div>
    </div>
  );
};

export default Orb;
