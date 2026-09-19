import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#2d2620] text-[#f7f2ea] rounded-lg shadow-xl border border-[#4a3f35]"
      >
        <div className="w-5 h-5 rounded-full bg-[#8b5e3c] flex items-center justify-center text-[#f7f2ea] flex-shrink-0">
          <CheckCircle className="w-3.5 h-3.5" />
        </div>
        <span className="font-serif text-sm tracking-wide">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-[#433930] rounded text-[#c7b9a7] transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
