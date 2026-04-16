import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;
const logoPng = `${base}automystics-logo.png`;

const collegeTypes = [
  'Engineering Colleges',
  'Arts & Science Colleges',
  'Medical Colleges',
  'Polytechnic Institutes',
  'Business Schools',
  'Law Colleges',
  'Agricultural Universities',
];

export function Scene1() {
  const [phase, setPhase] = useState(0);
  const [typeIdx, setTypeIdx] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    const interval = setInterval(() => {
      setTypeIdx(prev => (prev + 1) % collegeTypes.length);
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(30px)' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="text-center z-10 px-4">
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -30, scale: 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img src={logoPng} alt="AutoMystics" className="h-[8vh] mb-2 object-contain" />
          <span className="text-[1.2vw] tracking-[0.3em] uppercase text-[var(--color-primary)] font-semibold">
            Presents
          </span>
        </motion.div>

        <motion.h1
          className="text-[9vw] font-black tracking-tighter text-white leading-none mb-4 drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {'KALVICORE'.split('').map((char, i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 120, rotateX: -80, scale: 0.6 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 120, rotateX: -80, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18, delay: i * 0.06 + 0.3 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-[2.2vw] font-medium mb-6"
          initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
          animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(12px)', y: 20 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="text-white/80">Complete Campus.</span>{' '}
          <span className="text-[var(--color-primary)]">One Intelligent System.</span>
        </motion.p>

        <motion.div
          className="h-[3.5vh] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-[1.4vw] text-[var(--color-accent)] font-medium tracking-wide"
            key={typeIdx}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            Built for {collegeTypes[typeIdx]}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
