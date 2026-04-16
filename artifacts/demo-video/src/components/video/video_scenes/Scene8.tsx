import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
const logoPng = `${import.meta.env.BASE_URL}automystics-logo.png`;

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent z-0" />
      
      <div className="text-center z-10 px-4 flex flex-col items-center">
        
        {/* Module Callout */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="inline-block border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-6 py-2 rounded-full text-xl font-medium tracking-wide">
            40+ Modules. One Intelligent System.
          </div>
        </motion.div>

        {/* AutoMystics Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logoPng} alt="AutoMystics" className="h-32 mb-4 object-contain" />
        </motion.div>

        {/* Final Tagline */}
        <motion.p 
          className="text-2xl text-[var(--color-text-secondary)] font-medium max-w-2xl mt-4"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          Built exclusively for <span className="text-white">Tamil Nadu Arts & Science Colleges</span>.
        </motion.p>
      </div>
    </motion.div>
  );
}
