import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageFlipDirection } from '../types';

interface PageTurnContainerProps {
  pageKey: string;
  direction: PageFlipDirection;
  children: React.ReactNode;
}

export const PageTurnContainer: React.FC<PageTurnContainerProps> = ({
  pageKey,
  direction,
  children
}) => {
  // Variants for realistic page turning in 3D perspective
  const variants = {
    enter: (dir: PageFlipDirection) => ({
      rotateY: dir === 'next' ? 22 : dir === 'prev' ? -22 : 0,
      opacity: 0.15,
      x: dir === 'next' ? 35 : dir === 'prev' ? -35 : 0,
      filter: 'brightness(0.95)',
      transformOrigin: dir === 'next' ? 'right center' : 'left center'
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      x: 0,
      filter: 'brightness(1)',
      transition: {
        duration: 0.42,
        ease: [0.25, 1, 0.5, 1] as const
      }
    },
    exit: (dir: PageFlipDirection) => ({
      rotateY: dir === 'next' ? -28 : dir === 'prev' ? 28 : 0,
      opacity: 0.1,
      x: dir === 'next' ? -40 : dir === 'prev' ? 40 : 0,
      filter: 'brightness(0.92)',
      transformOrigin: dir === 'next' ? 'left center' : 'right center',
      transition: {
        duration: 0.38,
        ease: [0.5, 0, 0.75, 0] as const
      }
    })
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: 1400 }}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={pageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full h-full"
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
