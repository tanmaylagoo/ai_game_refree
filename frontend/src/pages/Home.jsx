import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Layers, Building2, Sparkles } from 'lucide-react';

const games = [
  {
    id: 'chess',
    name: 'Chess',
    description: 'Validate moves, analyze positions, and get strategic insights',
    icon: Crown,
    path: '/chess',
    gradient: 'from-neon-purple to-neon-blue',
    glow: 'shadow-neon-purple/20',
  },
  {
    id: 'uno',
    name: 'UNO',
    description: 'Check card plays, track hands, and master color strategies',
    icon: Layers,
    path: '/uno',
    gradient: 'from-neon-pink to-neon-purple',
    glow: 'shadow-neon-pink/20',
  },
  {
    id: 'monopoly',
    name: 'Monopoly',
    description: 'Manage sessions, validate trades, and track player assets',
    icon: Building2,
    path: '/monopoly',
    gradient: 'from-neon-blue to-neon-cyan',
    glow: 'shadow-neon-blue/20',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-full overflow-hidden w-full">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Starfield */}
        <div className="absolute inset-0 starfield pointer-events-none" />

        {/* Decorative glows */}
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-neon-purple/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-neon-blue/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] rounded-full bg-neon-pink/[0.03] blur-[100px] pointer-events-none" />

      {/* AI Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-4"
      >
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#0e113b] via-[#140b2d] to-[#1b0838] border border-white/[0.1] flex items-center justify-center animate-float shadow-[0_0_50px_rgba(168,85,247,0.25),0_0_25px_rgba(59,130,246,0.2),inset_12px_0_24px_-2px_rgba(59,130,246,0.7),inset_-12px_0_24px_-2px_rgba(236,72,153,0.7)]">
          {/* Eyes */}
          <svg width="60" height="20" viewBox="0 0 100 30" className="drop-shadow-[0_0_8px_#fff]">
            <path d="M 16 22 Q 30 7 44 22" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <path d="M 56 22 Q 70 7 84 22" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </svg>
          {/* Reflection */}
          <div className="absolute top-2.5 left-5 w-12 h-6 rounded-[40px/20px] bg-gradient-to-b from-white/30 to-transparent -rotate-[28deg]" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 w-28 h-28 rounded-full bg-neon-purple/20 blur-[40px] animate-glow-pulse -z-10" />
        {/* Shadow */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-gradient-to-r from-neon-purple/40 via-neon-blue/30 to-transparent blur-[3px]" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-8 relative z-10"
      >
        <p className="text-cosmic-200 text-lg max-w-md mx-auto leading-relaxed">
          Your intelligent tabletop game companion for move validation, rule checking, and strategy insights.
        </p>
      </motion.div>

      {/* Game Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full relative z-10"
      >
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(game.path)}
              className="glass-card p-6 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-4 shadow-lg ${game.glow} group-hover:shadow-xl transition-shadow duration-300`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-cosmic-50 font-[family-name:var(--font-accent)] mb-1.5">{game.name}</h3>
              <p className="text-sm text-cosmic-200 leading-relaxed">{game.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    </div>
  );
};

export default Home;
