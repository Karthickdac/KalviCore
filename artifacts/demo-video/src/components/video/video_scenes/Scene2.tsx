import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 4200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center preserve-3d"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute top-12 left-16 z-20">
        <motion.h2 
          className="text-[4vw] font-bold leading-tight"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-white">Command Center</span><br/>
          <span className="text-[var(--color-primary)]">At Your Fingertips</span>
        </motion.h2>
      </div>

      <motion.div 
        className="w-[75vw] h-[45vw] absolute right-[-5vw] bottom-[-5vw] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        initial={{ x: '50vw', y: '50vh', rotateZ: 15, rotateX: 30, scale: 0.8, opacity: 0 }}
        animate={phase >= 2 ? { x: 0, y: 0, rotateZ: -5, rotateX: 10, scale: 1, opacity: 1 } : { x: '50vw', y: '50vh', rotateZ: 15, rotateX: 30, scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent z-10 pointer-events-none" />
        <img 
          src={`${import.meta.env.BASE_URL}screens/01-dashboard.jpg`} 
          alt="Dashboard" 
          className="w-full h-full object-cover object-left-top"
        />
      </motion.div>

      {/* Floating stats callouts */}
      <motion.div 
        className="absolute top-1/3 left-16 bg-[var(--color-card)]/80 backdrop-blur-xl border border-[var(--color-primary)]/30 p-6 rounded-xl shadow-2xl z-30"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="text-[var(--color-text-secondary)] text-sm uppercase tracking-wider mb-1">Total Modules</div>
        <div className="text-4xl font-bold text-white font-display">40+</div>
      </motion.div>

      <motion.div 
        className="absolute top-[60%] left-[25%] bg-[var(--color-card)]/80 backdrop-blur-xl border border-[var(--color-accent)]/30 p-6 rounded-xl shadow-2xl z-30"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="text-[var(--color-text-secondary)] text-sm uppercase tracking-wider mb-1">User Roles</div>
        <div className="text-4xl font-bold text-white font-display">6</div>
      </motion.div>
    </motion.div>
  );
}
