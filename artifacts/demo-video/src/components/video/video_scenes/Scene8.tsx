import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '14-communications.jpg', label: 'Communications' },
  { img: '32-notifications.jpg', label: 'Notifications' },
  { img: '33-documents.jpg', label: 'Document Vault' },
  { img: '18-certificates.jpg', label: 'Certificates' },
  { img: '34-print-templates.jpg', label: 'Print Templates' },
  { img: '35-parent-portal.jpg', label: 'Parent Portal' },
];

export function Scene8() {
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
      className="absolute inset-0 flex flex-col items-center justify-center px-[5vw]"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 0.85, filter: 'blur(15px)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.h2
        className="text-[4vw] font-bold text-white mb-2 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.6 }}
      >
        Communication & <span className="text-[var(--color-accent)]">Documents</span>
      </motion.h2>
      <motion.p
        className="text-[1.1vw] text-white/40 mb-[3vh] text-center"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Announcements, Multi-channel Notifications, Certificates, Print Templates & Parent Portal
      </motion.p>

      <div className="grid grid-cols-3 gap-[1.2vw] w-full max-w-[82vw]">
        {screens.map((item, i) => (
          <motion.div
            key={item.img}
            className="relative rounded-xl overflow-hidden shadow-xl border border-white/10 aspect-video"
            initial={{ opacity: 0, scale: 0.7, rotateX: 20 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1, rotateX: 0 } : { opacity: 0, scale: 0.7, rotateX: 20 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20, delay: i * 0.1 }}
          >
            <img src={`${base}screens/${item.img}`} alt={item.label} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-3">
              <h3 className="text-white font-semibold text-[0.9vw]">{item.label}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
