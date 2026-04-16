import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const screens = [
  '08-fees.jpg',
  '25-payroll.jpg',
  '27-bulk-import.jpg'
];

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ opacity: 0, y: '50%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute left-16 top-1/2 -translate-y-1/2 z-30 w-1/3">
        <motion.h2 
          className="text-[4vw] font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          Finance & <br/>
          <span className="text-[var(--color-accent)]">HR Management</span>
        </motion.h2>
        <motion.p
          className="text-xl text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Streamlined fee collection, payroll processing, and bulk data operations.
        </motion.p>
      </div>

      <div className="absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[60vw] h-[80vh] perspective-1000">
        {screens.map((screen, i) => (
          <motion.div
            key={screen}
            className="absolute w-full h-[35vw] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ zIndex: 10 - i }}
            initial={{ opacity: 0, x: 200, y: i * 50, rotateY: -20, rotateX: 10, scale: 0.8 }}
            animate={phase >= 2 ? { 
              opacity: 1, 
              x: i * 60, 
              y: i * 60 - 60, 
              rotateY: -25 + (i * 2), 
              rotateX: 15 - (i * 2), 
              scale: 1 - (i * 0.05) 
            } : {}}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: i * 0.2 }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}screens/${screen}`} 
              alt={screen} 
              className="w-full h-full object-cover object-left-top"
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
