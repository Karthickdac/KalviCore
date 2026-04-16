import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const stats = [
  { label: 'Total Modules', value: '42+', color: 'var(--color-primary)' },
  { label: 'User Roles', value: '6', color: 'var(--color-accent)' },
  { label: 'Print Templates', value: '11', color: 'var(--color-secondary)' },
  { label: 'Report Types', value: '4', color: '#f59e0b' },
];

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 12 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute top-[6vh] left-[4vw] z-20">
        <motion.h2
          className="text-[3.8vw] font-bold leading-tight"
          initial={{ opacity: 0, x: -60 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="text-white">Intelligent</span>
          <br />
          <span className="text-[var(--color-primary)]">Dashboard</span>
        </motion.h2>
        <motion.p
          className="text-[1.2vw] text-white/50 mt-2 max-w-[25vw]"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Real-time insights across departments, students, fees, and attendance at a glance.
        </motion.p>
      </div>

      <motion.div
        className="absolute right-[-3vw] bottom-[-3vw] w-[70vw] h-[42vw] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        initial={{ x: '60vw', y: '40vh', rotateZ: 12, scale: 0.7, opacity: 0 }}
        animate={phase >= 2 ? { x: 0, y: 0, rotateZ: -3, scale: 1, opacity: 1 } : { x: '60vw', y: '40vh', rotateZ: 12, scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 70, damping: 18 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent z-10 pointer-events-none" />
        <img src={`${base}screens/01-dashboard.jpg`} alt="Dashboard" className="w-full h-full object-cover object-left-top" />
      </motion.div>

      <div className="absolute left-[4vw] top-[38vh] z-30 flex flex-col gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-xl shadow-xl"
            initial={{ opacity: 0, x: -40, scale: 0.8 }}
            animate={phase >= 3 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -40, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.12 }}
          >
            <div className="text-[0.8vw] text-white/50 uppercase tracking-wider">{s.label}</div>
            <div className="text-[2vw] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
