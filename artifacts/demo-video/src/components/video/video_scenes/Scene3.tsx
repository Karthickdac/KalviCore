import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

const screens = [
  { img: '02-departments.jpg', label: 'Departments' },
  { img: '05-courses.jpg', label: 'Courses' },
  { img: '06-subjects.jpg', label: 'Subjects' },
  { img: '16-timetable.jpg', label: 'Timetable' },
  { img: '41-laboratory.jpg', label: 'Laboratory' },
  { img: '09-exams.jpg', label: 'Examinations' },
  { img: '24-academic-calendar.jpg', label: 'Calendar' },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[4vw]"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.15 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div className="w-full text-center mb-[3vh]" initial={{ opacity: 0, y: -30 }} animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }} transition={{ duration: 0.6 }}>
        <h2 className="text-[4.5vw] font-bold text-white leading-none tracking-tight">
          Comprehensive <span className="text-[var(--color-primary)]">Academics</span>
        </h2>
        <p className="text-[1.2vw] text-white/40 mt-2">Departments, Courses, Subjects, Timetable, Exams & Calendar</p>
      </motion.div>

      <div className="relative w-full flex items-center justify-center" style={{ height: '55vh' }}>
        {screens.map((s, i) => {
          const offset = i - 3;
          return (
            <motion.div
              key={s.img}
              className="absolute rounded-xl overflow-hidden shadow-2xl border border-white/15"
              style={{ width: '30vw', height: '19vw', zIndex: 10 - Math.abs(offset) }}
              initial={{ opacity: 0, x: `${offset * 100}vw`, y: 80, scale: 0.5 }}
              animate={phase >= 2 ? {
                opacity: Math.abs(offset) <= 2 ? 1 : 0.4,
                x: `${offset * 14}vw`,
                y: Math.abs(offset) * 15,
                rotateY: offset * -12,
                scale: 1 - Math.abs(offset) * 0.08,
              } : {}}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: i * 0.08 }}
            >
              <img src={`${base}screens/${s.img}`} alt={s.label} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <span className="text-white/90 text-[0.9vw] font-semibold">{s.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
