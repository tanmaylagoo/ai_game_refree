import React from 'react';
import { motion } from 'framer-motion';
import { Info, Code, Cpu, Globe, Gamepad2, Shield, Brain, Zap } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';

const techStack = [
  { label: 'React 19', category: 'frontend' },
  { label: 'Vite', category: 'frontend' },
  { label: 'TailwindCSS', category: 'frontend' },
  { label: 'Framer Motion', category: 'frontend' },
  { label: 'FastAPI', category: 'backend' },
  { label: 'LangChain', category: 'backend' },
  { label: 'LangGraph', category: 'backend' },
  { label: 'ChromaDB', category: 'backend' },
];

const features = [
  { icon: Shield, title: 'Rule Validation', desc: 'Instant move legality checks powered by game engines' },
  { icon: Brain, title: 'AI Analysis', desc: 'Deep strategic insights and explanations from AI' },
  { icon: Gamepad2, title: 'Multi-Game', desc: 'Support for Chess, UNO, and Monopoly' },
  { icon: Zap, title: 'Real-time', desc: 'Instant feedback with every move you make' },
];

const About = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader title="About" subtitle="Learn about the AI Tabletop Referee" icon={Info} />

      <Card>
        <h2 className="text-xl font-semibold text-gradient font-[family-name:var(--font-accent)] mb-3">AI Tabletop Referee</h2>
        <p className="text-cosmic-200 leading-relaxed">
          An intelligent platform that acts as an AI-powered referee for tabletop games. It validates moves,
          explains rules, provides strategic insights, and ensures fair play across Chess, UNO, and Monopoly.
          Built with modern AI frameworks and a production-grade architecture.
        </p>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cosmic-50 mb-4">Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cosmic-50">{f.title}</h4>
                  <p className="text-xs text-cosmic-200 mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cosmic-50 mb-4">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {techStack.map((t) => (
            <span
              key={t.label}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                t.category === 'frontend'
                  ? 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple'
                  : 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
      </Card>

      <motion.a
        href="https://github.com/tanmaylagoo/ai_game_refree"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-cosmic-200 hover:text-cosmic-50 hover:border-white/[0.15] transition-all duration-300 text-sm font-medium"
      >
        <Code size={18} />
        View on GitHub
      </motion.a>
    </div>
  );
};

export default About;
