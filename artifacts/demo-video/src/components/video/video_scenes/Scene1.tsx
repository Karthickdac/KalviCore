import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
const logoPng = `${import.meta.env.BASE_URL}automystics-logo.png`;

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 200),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="text-center z-10 px-4">
        {/* Built by AutoMystics */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img src={logoPng} alt="AutoMystics" className="h-16 mb-2 object-contain" />
          <span className="text-sm tracking-widest uppercase text-[var(--color-primary)] font-semibold">Presents</span>
        </motion.div>

        {/* KalviCore */}
        <motion.h1 
          className="text-[8vw] font-black tracking-tighter text-white leading-none mb-6 drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {'KALVICORE'.split('').map((char, i) => (
            <motion.span 
              key={i} 
              style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 100, rotateX: -60, scale: 0.8 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 100, rotateX: -60, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: phase >= 1 ? i * 0.05 + 0.5 : 0 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        
        {/* Tagline */}
        <motion.p 
          className="text-[2.5vw] text-[var(--color-text-secondary)] font-medium"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(10px)', y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Complete Campus. <span className="text-[var(--color-accent)]">One Intelligent System.</span>
        </motion.p>
      </div>

      {/* Exiting element for next scene transition */}
      {phase >= 4 && (
        <motion.div 
          className="absolute inset-0 bg-[var(--color-primary)] z-20"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </motion.div>
  );
}
