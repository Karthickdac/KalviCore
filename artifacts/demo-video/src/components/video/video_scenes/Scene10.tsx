import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;
const logoPng = `${base}automystics-logo.png`;

const highlights = [
  '40+ Modules',
  '6 User Roles',
  '11 Print Templates',
  'Real-time Analytics',
  'Role-based Access',
  'Multi-channel Alerts',
];

export function Scene10() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/80 to-transparent z-0" />

      <div className="text-center z-10 flex flex-col items-center">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-[1vw] mb-[4vh]"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {highlights.map((h, i) => (
            <motion.div
              key={h}
              className="border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-[1.2vw] py-[0.5vh] rounded-full text-[1vw] font-medium"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.08 }}
            >
              {h}
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          className="text-[7vw] font-black tracking-tighter text-white leading-none mb-[2vh]"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18 }}
        >
          KALVI<span className="text-[var(--color-primary)]">CORE</span>
        </motion.h1>

        <motion.p
          className="text-[2vw] text-white/60 font-medium mb-[4vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Complete Campus. <span className="text-[var(--color-primary)]">One Intelligent System.</span>
        </motion.p>

        <motion.div
          className="flex flex-col items-center mb-[2vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logoPng} alt="AutoMystics" className="h-[10vh] mb-[1vh] object-contain" />
        </motion.div>

        <motion.p
          className="text-[1.3vw] text-white/40 font-medium"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          Built for Every College. Every Department. Every Role.
        </motion.p>
      </div>
    </motion.div>
  );
}
