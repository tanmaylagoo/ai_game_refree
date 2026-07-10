import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Gamepad2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const success = await register(username, email, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cosmic-900 starfield relative overflow-hidden px-4">
      {/* Decorative Cosmic Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/20 mb-4">
            <Gamepad2 size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight font-[family-name:var(--font-accent)]">
            AI Referee
          </h1>
          <p className="text-sm text-cosmic-200 mt-2 text-center">
            Register to claim your cosmic game key
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8 border border-white/[0.04] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-blue opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cosmic-100 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmic-300">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SpaceExplorer"
                  className="w-full bg-cosmic-900/60 border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-purple rounded-xl py-3 pl-11 pr-4 text-sm text-cosmic-50 placeholder-cosmic-300 outline-none transition-all duration-300 focus:ring-1 focus:ring-neon-purple/35"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cosmic-100 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmic-300">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-cosmic-900/60 border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-purple rounded-xl py-3 pl-11 pr-4 text-sm text-cosmic-50 placeholder-cosmic-300 outline-none transition-all duration-300 focus:ring-1 focus:ring-neon-purple/35"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cosmic-100 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmic-300">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cosmic-900/60 border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-purple rounded-xl py-3 pl-11 pr-12 text-sm text-cosmic-50 placeholder-cosmic-300 outline-none transition-all duration-300 focus:ring-1 focus:ring-neon-purple/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cosmic-300 hover:text-cosmic-100 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cosmic-100 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cosmic-300">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cosmic-900/60 border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-purple rounded-xl py-3 pl-11 pr-12 text-sm text-cosmic-50 placeholder-cosmic-300 outline-none transition-all duration-300 focus:ring-1 focus:ring-neon-purple/35"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cosmic-300 hover:text-cosmic-100 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple hover:to-neon-blue/90 text-white font-medium rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 shadow-lg shadow-neon-purple/10 hover:shadow-neon-purple/20 transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Cosmic Key</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Link */}
          <div className="mt-6 text-center text-xs text-cosmic-200 border-t border-white/[0.03] pt-5">
            <span>Already registered? </span>
            <Link
              to="/login"
              className="text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors duration-200"
            >
              Enter the chamber
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
