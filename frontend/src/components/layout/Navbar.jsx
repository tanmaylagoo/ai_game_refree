import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, ExternalLink, Gamepad2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const gameNames = {
  '/': 'Home',
  '/chess': 'Chess Referee',
  '/uno': 'UNO Referee',
  '/monopoly': 'Monopoly Referee',
  '/about': 'About',
};

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const currentGame = gameNames[location.pathname] || 'AI Referee';

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 h-16 glass-panel border-b border-white/[0.03] flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-3">
        <Gamepad2 size={18} className="text-neon-purple" />
        <h2 className="text-sm font-semibold text-cosmic-50 font-[family-name:var(--font-accent)] tracking-tight">{currentGame}</h2>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/tanmaylagoo/ai_game_refree"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-cosmic-200 hover:text-cosmic-50 hover:bg-white/[0.04] transition-all duration-300"
          aria-label="GitHub"
        >
          <ExternalLink size={18} />
        </a>

        {user && (
          <>
            <div className="h-6 w-[1px] bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-2 pl-1 select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-bold text-xs text-white shadow-sm uppercase">
                {user.username.charAt(0)}
              </div>
              <span className="text-xs text-cosmic-100 font-semibold hidden md:inline-block max-w-[100px] truncate">
                {user.username}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
