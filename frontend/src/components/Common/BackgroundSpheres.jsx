import React from "react";
import "./BackgroundSpheres.css";

const BackgroundSpheres = () => {
  // 4-point Star Sparkle SVG
  const SparkleIcon = ({ className = "", size = 32 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z"
        fill="#ffffff"
      />
    </svg>
  );

  return (
    <div className="bg-spheres-container">
      {/* 1. Large Top-Left Planet (Dark purple with pink crescent bottom-right) */}
      <div className="bg-sphere sphere-top-left">
        <div className="sphere-glow-crescent crescent-bottom-right"></div>
      </div>

      {/* 2. Large Top-Right Planet (Dark blue with cyan crescent left) */}
      <div className="bg-sphere sphere-top-right">
        <div className="sphere-glow-crescent crescent-left-top"></div>
      </div>

      {/* 3. Massive Horizon Dome (Planetary line curving behind the mascot) */}
      <div className="bg-sphere-horizon">
        <div className="horizon-glow-line"></div>
      </div>

      {/* 4. Precised Sparkle Glints (Placed along crescent edges like the image) */}
      
      {/* Sparkle 1: Top-Left Planet crescent curve */}
      <div className="bg-star-glint glint-1">
        <SparkleIcon size={24} className="glint-sparkle-pink" />
      </div>

      {/* Sparkle 2: Top-Right Planet crescent curve */}
      <div className="bg-star-glint glint-2">
        <SparkleIcon size={28} className="glint-sparkle-blue" />
      </div>

      {/* Sparkle 3: Horizon dome left curve */}
      <div className="bg-star-glint glint-3">
        <SparkleIcon size={26} className="glint-sparkle-blue" />
      </div>

      {/* Sparkle 4: Horizon dome right curve */}
      <div className="bg-star-glint glint-4">
        <SparkleIcon size={22} className="glint-sparkle-pink" />
      </div>
    </div>
  );
};

export default BackgroundSpheres;
