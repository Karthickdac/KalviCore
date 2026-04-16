import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '08-fees.jpg', label: 'Fees & Payments' },
  { img: '25-payroll.jpg', label: 'Payroll Management' },
  { img: '27-bulk-import.jpg', label: 'Bulk Import/Export' },
  { img: '38-fundraising.jpg', label: 'Fundraising' },
];

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      initial={{ clipPath: 'inset(50% 0 50% 0)' }}
      animate={{ clipPath: 'inset(0% 0 0% 0)' }}
      exit={{ opacity: 0, y: '30%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute left-[5vw] top-1/2 -translate-y-1/2 z-30 w-[28vw]">
        <motion.h2
          className="text-[3.8vw] font-bold text-white leading-tight mb-3"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
          Finance &<br />
          <span className="text-[var(--color-accent)]">HR Management</span>
        </motion.h2>
        <motion.p
          className="text-[1.1vw] text-white/50 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Fee collection with instalments, scholarship tracking, payroll processing, bulk data import/export, and fundraising campaigns.
        </motion.p>
      </div>

      <div className="absolute right-[-5vw] top-1/2 -translate-y-1/2 w-[58vw]">
        {screens.map((s, i) => (
          <motion.div
            key={s.img}
            className="absolute rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ width: '48vw', height: '30vw', zIndex: screens.length - i }}
            initial={{ opacity: 0, x: 300, y: i * 30, scale: 0.7 }}
            animate={phase >= 3 ? {
              opacity: 1,
              x: i * 50,
              y: i * 50 - 80,
              rotateZ: -3 + i * 2,
              scale: 1 - i * 0.04,
            } : {}}
            transition={{ type: 'spring', stiffness: 90, damping: 18, delay: i * 0.15 }}
          >
            <img src={`${base}screens/${s.img}`} alt={s.label} className="w-full h-full object-cover object-left-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="text-white/90 text-[1vw] font-semibold bg-black/40 px-3 py-1 rounded-full">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
