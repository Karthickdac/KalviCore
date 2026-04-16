import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const screens = [
  '02-departments.jpg',
  '05-courses.jpg',
  '06-subjects.jpg',
  '16-timetable.jpg',
  '17-assignments.jpg',
  '09-exams.jpg'
];

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500), // starts cascade
      setTimeout(() => setPhase(3), 4000), // start exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center preserve-3d"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.2 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 text-center w-full">
        <motion.h2 
          className="text-[5vw] font-bold text-white leading-none tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Comprehensive <span className="text-[var(--color-secondary)]">Academics</span>
        </motion.h2>
      </div>

      <div className="relative w-[120vw] h-[60vh] mt-24 flex items-center justify-center">
        {screens.map((screen, i) => {
          const isCenter = i === 2 || i === 3;
          
          return (
            <motion.div
              key={screen}
              className={`absolute w-[35vw] h-[22vw] rounded-xl overflow-hidden shadow-2xl border border-white/20`}
              style={{
                zIndex: isCenter ? 20 : 10 - Math.abs(2.5 - i),
              }}
              initial={{ 
                opacity: 0, 
                x: `${(i - 2.5) * 80}vw`, 
                y: 100, 
                rotateY: (i - 2.5) * -15, 
                scale: 0.5 
              }}
              animate={phase >= 2 ? { 
                opacity: isCenter ? 1 : 0.6, 
                x: `${(i - 2.5) * 20}vw`, 
                y: Math.abs(i - 2.5) * 30, 
                rotateY: (i - 2.5) * -20, 
                scale: 1 - Math.abs(i - 2.5) * 0.1 
              } : {}}
              transition={{ 
                type: 'spring', 
                stiffness: 100, 
                damping: 20, 
                delay: i * 0.15 
              }}
            >
              <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors" />
              <img 
                src={`${import.meta.env.BASE_URL}screens/${screen}`} 
                alt={screen} 
                className="w-full h-full object-cover object-top"
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
