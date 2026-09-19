import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface CelebrationSealProps {
  show: boolean;
}

export const CelebrationSeal: React.FC<CelebrationSealProps> = ({ show }) => {
  useEffect(() => {
    if (show) {
      soundManager.playCelebration();
    }
  }, [show]);

  if (!show) return null;

  // Generate a few delicate warm gold/copper paper confetti particles
  const particles = [
    { x: -60, y: -40, delay: 0.1, rotate: 18, color: '#c59d5f' },
    { x: 50, y: -45, delay: 0.15, rotate: -25, color: '#9c3e2d' },
    { x: -35, y: 35, delay: 0.2, rotate: 45, color: '#8b5e3c' },
    { x: 55, y: 30, delay: 0.25, rotate: -15, color: '#d4af37' },
    { x: -75, y: 5, delay: 0.12, rotate: 30, color: '#5a6b5c' },
    { x: 70, y: -10, delay: 0.18, rotate: -40, color: '#c59d5f' },
    { x: 0, y: -65, delay: 0.08, rotate: 12, color: '#8b6534' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-3 p-3.5 rounded-lg border border-[#d6c7b2] bg-[#f8f3eb] shadow-[0_2px_8px_rgba(70,55,40,0.06)] text-center overflow-hidden"
      >
        {/* Floating delicate sparkles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.2, 0.8],
              opacity: [0, 1, 0],
              x: p.x,
              y: p.y,
              rotate: [0, p.rotate * 2]
            }}
            transition={{
              duration: 1.4,
              delay: p.delay,
              ease: 'easeOut'
            }}
            className="absolute left-1/2 top-1/2 w-1.5 h-2 rounded-[1px] pointer-events-none"
            style={{ backgroundColor: p.color }}
          />
        ))}

        {/* Wax / Letterpress Stamp Seal */}
        <div className="flex items-center justify-center gap-2">
          <motion.div
            initial={{ rotate: -20, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-6 h-6 rounded-full border border-[#8b5e3c] bg-[#ede1d1] flex items-center justify-center text-[#8b5e3c]"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </motion.div>

          <span className="font-serif text-[17px] font-semibold tracking-wide text-[#3d332a]">
            All done for today
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#b3894b]" />
        </div>

        <p className="mt-1 text-[12px] font-hand text-[15px] text-[#7d7162] tracking-wide">
          Every task marked off. Enjoy a restful evening.
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
