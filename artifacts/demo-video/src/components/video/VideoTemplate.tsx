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

const SCENE_DURATIONS = {
  intro: 4000,
  dashboard: 5000,
  academics: 5000,
  students: 5000,
  finance: 4500,
  operations: 4500,
  admin: 5000,
  outro: 4000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg-dark)] perspective-1000">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
          animate={{ 
            x: ['-20%', '20%', '-10%', '30%', '0%'],
            y: ['-20%', '10%', '30%', '-10%', '20%'],
            scale: [1, 1.2, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-10 right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{ 
            x: ['10%', '-20%', '0%', '-30%', '10%'],
            y: ['10%', '-30%', '20%', '0%', '-20%'],
            scale: [1.2, 0.8, 1.1, 0.9, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Persistent Midground Layer */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-[var(--color-primary)] opacity-20 z-0"
        animate={{
          x: ['80vw', '10vw', '60vw', '85vw', '15vw', '70vw', '5vw', '50vw'][currentScene],
          y: ['20vh', '70vh', '15vh', '80vh', '25vh', '85vh', '40vh', '50vh'][currentScene],
          scale: [1, 1.5, 0.8, 2, 1.2, 0.6, 1.8, 1][currentScene],
          rotate: [0, 45, 90, 135, 180, 225, 270, 315][currentScene],
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute h-[2px] bg-[var(--color-primary)] opacity-30 z-0"
        animate={{
          left: ['-10%', '20%', '0%', '50%', '10%', '60%', '30%', '40%'][currentScene],
          width: ['120%', '40%', '80%', '20%', '70%', '30%', '50%', '20%'][currentScene],
          top: ['50%', '80%', '30%', '10%', '60%', '40%', '90%', '50%'][currentScene],
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Foreground Content inside AnimatePresence */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="popLayout">
          {currentScene === 0 && <Scene1 key="intro" />}
          {currentScene === 1 && <Scene2 key="dashboard" />}
          {currentScene === 2 && <Scene3 key="academics" />}
          {currentScene === 3 && <Scene4 key="students" />}
          {currentScene === 4 && <Scene5 key="finance" />}
          {currentScene === 5 && <Scene6 key="operations" />}
          {currentScene === 6 && <Scene7 key="admin" />}
          {currentScene === 7 && <Scene8 key="outro" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
