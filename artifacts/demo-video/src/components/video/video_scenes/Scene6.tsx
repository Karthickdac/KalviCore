import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const screens = [
  '10-hostels.jpg',
  '11-transport.jpg',
  '12-library.jpg',
  '13-events.jpg',
  '15-inventory.jpg',
  '39-visitors.jpg'
];

export function Scene6() {
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
      className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-gradient-to-b from-[var(--color-bg-dark)] to-[var(--color-primary)]/20"
      initial={{ opacity: 0, y: '-100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.h2 
        className="text-[4vw] font-bold text-white mb-16 text-center z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6 }}
      >
        Seamless <span className="text-[var(--color-primary)]">Campus Operations</span>
      </motion.h2>

      <div className="relative w-full max-w-6xl h-[50vh] flex items-center justify-center perspective-1000">
        {screens.map((screen, i) => {
          // Circular arrangement
          const angle = (i / screens.length) * Math.PI * 2;
          const radius = 35; // vw
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={screen}
              className="absolute w-[25vw] h-[15vw] rounded-xl overflow-hidden shadow-2xl border border-white/20 origin-center"
              initial={{ opacity: 0, x: 0, z: -100, scale: 0 }}
              animate={phase >= 2 ? { 
                opacity: z > -10 ? 1 : 0.4, 
                x: `${x}vw`, 
                z: `${z * 10}px`,
                rotateY: (x / radius) * 20,
                scale: z > -10 ? 1.2 : 0.8
              } : {}}
              transition={{ type: 'spring', stiffness: 50, damping: 20, delay: i * 0.1 }}
              style={{ zIndex: Math.round(z + 50) }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}screens/${screen}`} 
                alt={screen} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/10" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
