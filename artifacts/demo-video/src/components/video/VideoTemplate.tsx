import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Scene9 } from './video_scenes/Scene9';
import { Scene10 } from './video_scenes/Scene10';

const SCENE_DURATIONS = {
  intro: 4500,
  dashboard: 5000,
  academics: 5500,
  students: 5500,
  finance: 5000,
  campus: 5500,
  admin: 5000,
  comms: 5000,
  extras: 5000,
  outro: 5000,
};

const orbPositions = [
  { x: '45vw', y: '40vh', scale: 2.5 },
  { x: '10vw', y: '15vh', scale: 1.2 },
  { x: '75vw', y: '50vh', scale: 1.8 },
  { x: '20vw', y: '70vh', scale: 1 },
  { x: '60vw', y: '25vh', scale: 2 },
  { x: '5vw', y: '55vh', scale: 1.5 },
  { x: '80vw', y: '10vh', scale: 1.3 },
  { x: '30vw', y: '80vh', scale: 0.8 },
  { x: '65vw', y: '65vh', scale: 1.6 },
  { x: '50vw', y: '30vh', scale: 2.2 },
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg-dark)]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-15"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
          animate={{
            x: ['-20%', '30%', '-10%', '20%', '0%'],
            y: ['-20%', '10%', '30%', '-10%', '20%'],
            scale: [1, 1.3, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-10 right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{
            x: ['10%', '-30%', '0%', '-20%', '10%'],
            y: ['10%', '-30%', '20%', '0%', '-20%'],
            scale: [1.2, 0.8, 1.1, 0.9, 1.2],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        className="absolute w-24 h-24 rounded-full border border-[var(--color-primary)]/30 z-[1]"
        animate={orbPositions[currentScene]}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute w-16 h-16 rounded-lg border border-[var(--color-accent)]/20 z-[1]"
        animate={{
          x: orbPositions[(currentScene + 3) % 10].x,
          y: orbPositions[(currentScene + 3) % 10].y,
          rotate: currentScene * 45,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent z-[1]"
        animate={{
          left: ['-10%', '20%', '0%', '50%', '10%', '60%', '30%', '40%', '15%', '35%'][currentScene],
          width: ['120%', '40%', '80%', '20%', '70%', '30%', '50%', '60%', '90%', '25%'][currentScene],
          top: ['50%', '80%', '30%', '10%', '60%', '40%', '90%', '50%', '20%', '70%'][currentScene],
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="popLayout">
          {currentScene === 0 && <Scene1 key="intro" />}
          {currentScene === 1 && <Scene2 key="dashboard" />}
          {currentScene === 2 && <Scene3 key="academics" />}
          {currentScene === 3 && <Scene4 key="students" />}
          {currentScene === 4 && <Scene5 key="finance" />}
          {currentScene === 5 && <Scene6 key="campus" />}
          {currentScene === 6 && <Scene7 key="admin" />}
          {currentScene === 7 && <Scene8 key="comms" />}
          {currentScene === 8 && <Scene9 key="extras" />}
          {currentScene === 9 && <Scene10 key="outro" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
