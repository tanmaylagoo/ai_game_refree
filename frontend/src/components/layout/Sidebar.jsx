import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Home, Crown, Layers, Building2, Info, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chess', label: 'Chess', icon: Crown },
  { path: '/uno', label: 'UNO', icon: Layers },
  { path: '/monopoly', label: 'Monopoly', icon: Building2 },
  { path: '/about', label: 'About', icon: Info },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-full w-[260px] glass-panel z-40 flex flex-col py-8 px-5"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/20">
          <Gamepad2 size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gradient font-[family-name:var(--font-accent)] tracking-tight">AI Referee</span>
          <span className="text-[10px] text-cosmic-300 uppercase tracking-[0.15em] font-medium">v1.0.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 ${
                  isActive
                    ? 'text-cosmic-50 bg-white/[0.03] border-neon-purple font-semibold'
                    : 'text-cosmic-200 border-transparent hover:text-cosmic-50 hover:bg-white/[0.02] hover:border-neon-purple/50 hover:translate-x-0.5'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile and Branding */}
      <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-white/[0.03]">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-bold text-sm text-white shadow-md shadow-neon-purple/20 uppercase select-none">
              {user.username.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-cosmic-50 truncate">{user.username}</span>
              <span className="text-[10px] text-cosmic-300 truncate">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-cosmic-300 hover:text-red-400 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer active:scale-95"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        <div className="px-2">
          <p className="text-[10px] text-cosmic-300">Powered by AI</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
