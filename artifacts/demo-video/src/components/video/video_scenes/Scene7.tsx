import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const screens = [
  '20-settings.jpg',
  '21-users.jpg',
  '40-access-management.jpg',
  '22-reports.jpg',
  '34-print-templates.jpg'
];

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, rotate: -5, scale: 0.9 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute right-16 top-1/2 -translate-y-1/2 z-30 w-1/3 text-right">
        <motion.h2 
          className="text-[4vw] font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6 }}
        >
          Powerful <br/>
          <span className="text-[var(--color-secondary)]">Administration</span>
        </motion.h2>
        <motion.p
          className="text-xl text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Granular access control, comprehensive reports, and customizable templates.
        </motion.p>
      </div>

      <div className="absolute left-[5vw] top-1/2 -translate-y-1/2 w-[50vw] h-[70vh] perspective-1000">
        {screens.map((screen, i) => (
          <motion.div
            key={screen}
            className="absolute w-full h-[30vw] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-primary)]/30"
            style={{ zIndex: i }}
            initial={{ opacity: 0, y: -200, scale: 0.5, rotateZ: i * 5 }}
            animate={phase >= 2 ? { 
              opacity: 1, 
              y: i * 40 - 80,
              x: i * 20,
              scale: 1,
              rotateZ: -5 + (i * 3)
            } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: i * 0.15 }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}screens/${screen}`} 
              alt={screen} 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
