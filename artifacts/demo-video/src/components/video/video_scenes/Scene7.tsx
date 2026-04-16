import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '20-settings.jpg', label: 'Settings' },
  { img: '21-users.jpg', label: 'User Management' },
  { img: '40-access-management.jpg', label: 'Access Control' },
  { img: '22-reports.jpg', label: 'Reports & Analytics' },
  { img: '23-activity-log.jpg', label: 'Activity Log' },
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
      className="absolute inset-0 flex items-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, rotateY: -15, scale: 0.9 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 z-30 w-[28vw] text-right">
        <motion.h2
          className="text-[3.8vw] font-bold text-white leading-tight mb-3"
          initial={{ opacity: 0, x: 40 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.6 }}
        >
          Powerful
          <br />
          <span className="text-[var(--color-secondary)]">Administration</span>
        </motion.h2>
        <motion.p
          className="text-[1.1vw] text-white/50 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Role-based access for 6 user types, comprehensive analytics, audit trails, and institutional configuration.
        </motion.p>
      </div>

      <div className="absolute left-[3vw] top-1/2 -translate-y-1/2 w-[55vw]">
        {screens.map((s, i) => (
          <motion.div
            key={s.img}
            className="absolute rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-primary)]/20"
            style={{ width: '46vw', height: '28vw', zIndex: i }}
            initial={{ opacity: 0, y: -250, scale: 0.4, rotateZ: i * 6 }}
            animate={phase >= 2 ? {
              opacity: 1,
              y: i * 35 - 80,
              x: i * 18,
              scale: 1,
              rotateZ: -4 + i * 2.5,
            } : {}}
            transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.12 }}
          >
            <img src={`${base}screens/${s.img}`} alt={s.label} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="text-white/90 text-[0.9vw] font-semibold bg-black/40 px-3 py-1 rounded-full">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
