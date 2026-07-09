import React from 'react';
import { motion } from 'framer-motion';

const propertyColors = {
  brown: '#8B4513', lightblue: '#87CEEB', pink: '#FF69B4', orange: '#FFA500',
  red: '#FF0000', yellow: '#FFD700', green: '#228B22', blue: '#0000CD',
  default: '#6b7280',
};

const PropertyCard = ({ name, owner, price, color = 'default' }) => {
  const barColor = propertyColors[color?.toLowerCase()] || propertyColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card overflow-hidden"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: barColor }} />
      <div className="p-3">
        <h4 className="text-xs font-semibold text-cosmic-50 truncate">{name}</h4>
        <p className="text-[10px] text-cosmic-300 mt-1">
          {owner ? `Owned by ${owner}` : 'Unowned'}
        </p>
        {price && <p className="text-xs text-neon-green font-medium mt-1">${price}</p>}
      </div>
    </motion.div>
  );
};

export default PropertyCard;
