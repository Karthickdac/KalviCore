import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '04-staff.jpg', label: 'Staff Management' },
  { img: '19-leaves.jpg', label: 'Leave Tracking' },
  { img: '30-backup.jpg', label: 'Data Backup' },
  { img: '36-dashboard-settings.jpg', label: 'Dashboard Customization' },
];

const features = [
  { icon: 'shield', text: 'Role-Based Access Control' },
  { icon: 'database', text: 'Complete Data Backup & Restore' },
  { icon: 'print', text: '11 Print Templates' },
  { icon: 'users', text: '6 User Roles' },
  { icon: 'chart', text: 'Real-time Analytics' },
  { icon: 'mobile', text: 'Multi-channel Notifications' },
];

export function Scene9() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateZ: 3 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute left-[5vw] top-1/2 -translate-y-1/2 z-30 w-[35vw]">
        <motion.h2
          className="text-[3.5vw] font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          And <span className="text-[var(--color-primary)]">Much More...</span>
        </motion.h2>

        <div className="flex flex-col gap-[1vh]">
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-[var(--color-primary)]" />
              <span className="text-[1.1vw] text-white/70">{f.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute right-[3vw] top-1/2 -translate-y-1/2 grid grid-cols-2 gap-[1vw]" style={{ width: '48vw' }}>
        {screens.map((s, i) => (
          <motion.div
            key={s.img}
            className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative"
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18, delay: i * 0.12 }}
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
