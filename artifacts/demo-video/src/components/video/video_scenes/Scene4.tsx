import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const screens = [
  { img: '03-students.jpg', title: 'Student Records' },
  { img: '07-attendance.jpg', title: 'Attendance' },
  { img: '26-cgpa.jpg', title: 'CGPA Tracking' },
  { img: '28-hall-tickets.jpg', title: 'Hall Tickets' },
  { img: '31-id-cards.jpg', title: 'ID Cards' },
  { img: '29-student-portal.jpg', title: 'Student Portal' }
];

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-12"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="w-full max-w-7xl flex flex-col h-full justify-center"
      >
        <motion.h2 
          className="text-[4vw] font-bold text-white mb-12 text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          Complete <span className="text-[var(--color-primary)]">Student Lifecycle</span>
        </motion.h2>

        <div className="grid grid-cols-3 gap-8">
          {screens.map((item, i) => (
            <motion.div
              key={item.img}
              className="relative rounded-xl overflow-hidden shadow-xl border border-white/10 group aspect-video"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.1 }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}screens/${item.img}`} 
                alt={item.title} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold text-lg">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
