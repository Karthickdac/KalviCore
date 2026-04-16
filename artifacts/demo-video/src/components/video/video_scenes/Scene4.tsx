import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '03-students.jpg', title: 'Student Records' },
  { img: '07-attendance.jpg', title: 'Attendance Tracking' },
  { img: '26-cgpa.jpg', title: 'CGPA Tracker' },
  { img: '28-hall-tickets.jpg', title: 'Hall Tickets' },
  { img: '31-id-cards.jpg', title: 'ID Card Generation' },
  { img: '29-student-portal.jpg', title: 'Student Portal' },
];

export function Scene4() {
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
      className="absolute inset-0 flex flex-col items-center justify-center px-[5vw] py-[4vh]"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.h2
        className="text-[4vw] font-bold text-white mb-[2vh] text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.6 }}
      >
        Complete <span className="text-[var(--color-primary)]">Student Lifecycle</span>
      </motion.h2>
      <motion.p
        className="text-[1.1vw] text-white/40 mb-[3vh] text-center"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        From admission to graduation - every touchpoint covered
      </motion.p>

      <div className="grid grid-cols-3 gap-[1.5vw] w-full max-w-[85vw]">
        {screens.map((item, i) => (
          <motion.div
            key={item.img}
            className="relative rounded-xl overflow-hidden shadow-xl border border-white/10 aspect-video"
            initial={{ opacity: 0, y: 60, scale: 0.85 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, delay: i * 0.1 }}
          >
            <img src={`${base}screens/${item.img}`} alt={item.title} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-3">
              <h3 className="text-white font-semibold text-[1vw]">{item.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
