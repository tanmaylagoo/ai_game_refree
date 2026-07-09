import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  Red: '#ef4444',
  Blue: '#3b82f6',
  Green: '#22c55e',
  Yellow: '#eab308',
  Wild: null,
  'Wild-Draw4': null,
};

const UnoCard = ({ color = 'Blue', value = '0', onClick, isSelected = false, size = 'md' }) => {
  const bgColor = colorMap[color];
  const isWild = color === 'Wild' || color === 'Wild-Draw4';
  const sizeClasses = {
    sm: 'w-14 h-20 text-sm',
    md: 'w-20 h-28 text-lg',
    lg: 'w-28 h-40 text-2xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -6 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-2xl cursor-pointer relative flex items-center justify-center font-bold text-white shadow-lg transition-all duration-200 select-none ${
        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-cosmic-900 scale-105' : ''
      }`}
      style={{
        background: isWild
          ? 'linear-gradient(135deg, #ef4444, #3b82f6, #22c55e, #eab308)'
          : bgColor,
        boxShadow: isSelected
          ? `0 0 25px ${bgColor || 'rgba(168,85,247,0.4)'}40`
          : `0 4px 15px ${bgColor || 'rgba(0,0,0,0.3)'}30`,
      }}
    >
      {/* Inner card oval */}
      <div className="absolute inset-2 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-[family-name:var(--font-accent)]">
          {value}
        </span>
      </div>
    </motion.div>
  );
};

export default UnoCard;
