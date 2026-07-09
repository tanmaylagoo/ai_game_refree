import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 mb-6"
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
          <Icon size={22} className="text-neon-purple" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gradient font-[family-name:var(--font-accent)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-cosmic-200 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default PageHeader;
