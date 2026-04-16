import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '10-hostels.jpg', label: 'Hostel' },
  { img: '11-transport.jpg', label: 'Transport' },
  { img: '12-library.jpg', label: 'Library' },
  { img: '13-events.jpg', label: 'Events' },
  { img: '42-sports-ncc.jpg', label: 'Sports & NCC' },
  { img: '39-visitors.jpg', label: 'Visitors' },
  { img: '37-placements.jpg', label: 'Placements' },
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
      className="absolute inset-0 flex flex-col items-center justify-center px-[4vw]"
      initial={{ opacity: 0, y: '-100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ scale: 1.4, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-dark)] to-[var(--color-primary)]/15 z-0" />

      <motion.h2
        className="text-[4.2vw] font-bold text-white mb-2 text-center z-20 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6 }}
      >
        Seamless <span className="text-[var(--color-primary)]">Campus Operations</span>
      </motion.h2>
      <motion.p
        className="text-[1.1vw] text-white/40 mb-[4vh] text-center z-20 relative"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Hostel, Transport, Library, Events, Sports & NCC, Visitor Management & Placements
      </motion.p>

      <div className="relative w-full flex flex-wrap items-center justify-center gap-[1.2vw] z-20" style={{ maxWidth: '88vw' }}>
        {screens.map((s, i) => (
          <motion.div
            key={s.img}
            className="rounded-xl overflow-hidden shadow-2xl border border-white/15 relative"
            style={{ width: i < 4 ? '20vw' : '20vw', height: '12.5vw' }}
            initial={{ opacity: 0, y: 80, scale: 0.6, rotateX: 30 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.08 }}
          >
            <img src={`${base}screens/${s.img}`} alt={s.label} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-white/90 text-[0.85vw] font-semibold">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
