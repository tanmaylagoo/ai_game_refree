import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin } from 'lucide-react';

const PlayerCard = ({ name, balance = 0, properties = [], isCurrent = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 ${
        isCurrent ? 'border-neon-purple/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCurrent ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/[0.04] text-cosmic-200'
          }`}>
            <User size={16} />
          </div>
          <span className="text-sm font-semibold text-cosmic-50">{name}</span>
        </div>
        {isCurrent && (
          <span className="px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-medium text-neon-purple uppercase tracking-wider">
            Current Turn
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-neon-green font-[family-name:var(--font-accent)]">
        ${balance.toLocaleString()}
      </div>
      {properties.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-cosmic-200">
          <MapPin size={12} />
          <span>{properties.length} properties</span>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerCard;
