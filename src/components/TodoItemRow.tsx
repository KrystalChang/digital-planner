import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Clock, 
  Mail, 
  GripVertical, 
  Trash2, 
  CalendarPlus, 
  Sparkles 
} from 'lucide-react';
import { TodoItem } from '../types';

interface TodoItemRowProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onSchedule?: (item: TodoItem) => void;
  dragHandleProps?: any;
}

export const TodoItemRow: React.FC<TodoItemRowProps> = ({
  item,
  onToggle,
  onDelete,
  onSchedule
}) => {
  const [showActions, setShowActions] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 800);
    }
    onToggle(item.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'PLANNER_TODO',
      id: item.id,
      title: item.title,
      duration: item.estimatedDuration,
      priority: item.priority
    }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = mins / 60;
      return `${h % 1 === 0 ? h : h.toFixed(1)} hr`;
    }
    return `${mins} min`;
  };

  const priorityStyles = {
    low: {
      bg: 'bg-[#edf4ee]',
      text: 'text-[#356143]',
      label: 'Low'
    },
    medium: {
      bg: 'bg-[#fef6e6]',
      text: 'text-[#845d22]',
      label: 'Medium'
    },
    high: {
      bg: 'bg-[#faedea]',
      text: 'text-[#9c392c]',
      label: 'High'
    }
  };

  const currentPriority = priorityStyles[item.priority] || priorityStyles.low;

  // Decide icon based on title keywords (e.g. email gets mail icon, others clock)
  const isEmail = /email|mail|inbox/i.test(item.title);

  return (
    <div
      draggable={!item.completed}
      onDragStart={handleDragStart}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all select-none ${
        item.completed
          ? 'bg-[#fbf8f3]/80 border-[#e8ded0]'
          : 'bg-[#ffffff] border-[#e2d6c6] hover:border-[#b5a38f] hover:shadow-xs'
      }`}
    >
      {/* Sparkle Feedback on completion */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [1, 1, 0], y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute left-6 top-1 pointer-events-none flex items-center gap-1 text-[#467258] z-20"
          >
            <Sparkles className="w-4 h-4 fill-[#467258]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left: Checkbox & Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Custom Hand-Drawn Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
          className={`relative flex items-center justify-center w-5 h-5 rounded-[5px] shrink-0 transition-all ${
            item.completed
              ? 'bg-[#527c65] text-white shadow-xs'
              : 'border-[1.8px] border-[#b8ab9a] hover:border-[#527c65] bg-white'
          }`}
        >
          {item.completed && (
            <motion.div
              initial={{ scale: 0.2, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
            </motion.div>
          )}
        </button>

        {/* Task Title with SVG Handwritten Strikethrough Line */}
        <div className="relative inline-block max-w-full">
          <span
            className={`text-sm transition-opacity duration-200 block truncate ${
              item.completed
                ? 'text-[#423a31] opacity-75 font-medium'
                : 'text-[#1a1715] font-medium'
            }`}
          >
            {item.title}
          </span>

          {/* Straight line sweeping from left to right */}
          {item.completed && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M -1,10.5 L 101,10.5"
                fill="none"
                stroke="#3d352b"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Right: Duration, Priority Badge, Drag Handle / Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Duration badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f4ede3] text-[#4d4235] text-[11px] font-medium">
          {isEmail ? (
            <Mail className="w-3 h-3 text-[#786a5a]" />
          ) : (
            <Clock className="w-3 h-3 text-[#786a5a]" />
          )}
          <span>{formatDuration(item.estimatedDuration)}</span>
        </div>

        {/* Priority Badge */}
        <div
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-black/5 ${currentPriority.bg} ${currentPriority.text}`}
        >
          {currentPriority.label}
        </div>

        {/* Quick Action Buttons or Drag Handle */}
        <div className="flex items-center gap-1 pl-1">
          {showActions ? (
            <div className="flex items-center gap-1 animate-in fade-in duration-150">
              {!item.completed && onSchedule && (
                <button
                  type="button"
                  title="Schedule on timeline"
                  onClick={() => onSchedule(item)}
                  className="p-1 rounded text-[#635547] hover:text-[#221e1a] hover:bg-[#ebdcc9] transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  title="Delete task"
                  onClick={() => onDelete(item.id)}
                  className="p-1 rounded text-[#a63f30] hover:bg-[#fce9e6] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div 
              title="Drag to schedule on timeline"
              className="p-0.5 text-[#a89b8a] hover:text-[#524434] cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
