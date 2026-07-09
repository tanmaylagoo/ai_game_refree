import React from 'react';
import { motion } from 'framer-motion';

const glowStyles = {
  purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  pink: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
};

const Card = ({ children, className = '', hover = true, glow = null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card p-5 ${hover ? 'hover:bg-white/[0.035] hover:border-white/[0.12]' : ''} ${glow ? glowStyles[glow] : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
