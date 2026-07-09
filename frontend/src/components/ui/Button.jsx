import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40',
  secondary: 'bg-white/[0.03] border border-white/[0.08] text-cosmic-200 hover:text-cosmic-50 hover:bg-white/[0.06] hover:border-white/[0.15]',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40',
  ghost: 'text-cosmic-200 hover:text-cosmic-50 hover:bg-white/[0.04]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button = ({ variant = 'primary', size = 'md', isLoading = false, disabled = false, children, className = '', ...rest }) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </motion.button>
  );
};

export default Button;
