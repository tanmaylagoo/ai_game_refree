import React from 'react';
import { motion } from 'framer-motion';

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-4"
    >
      <div className={`${sizeMap[size]} rounded-full border-neon-purple/30 border-t-neon-purple animate-spin`} />
      {text && (
        <p className="text-sm text-cosmic-200 animate-pulse">{text}</p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
