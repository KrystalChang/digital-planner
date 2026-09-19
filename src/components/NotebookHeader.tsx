import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  LogIn,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { User, PlannerViewMode } from '../types';
import { getDayName } from '../utils/dateUtils';

interface NotebookHeaderProps {
  currentDate: Date;
  viewMode: PlannerViewMode;
  currentUser: User | null;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: (date: Date) => void;
  onToggleView: (view: PlannerViewMode) => void;
  onOpenUserModal: () => void;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
}

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  currentDate,
  viewMode,
  currentUser,
  onPrevDay,
  onNextDay,
  onSelectDate,
  onToggleView,
  onOpenUserModal,
  onToggleSound,
  isSoundEnabled
}) => {
  // Mini Calendar logic for current month
  const [miniCalMonth, setMiniCalMonth] = useState(new Date(currentDate));

  React.useEffect(() => {
    setMiniCalMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate]);

  const monthName = miniCalMonth.toLocaleDateString('en-US', { month: 'short' });
  const year = miniCalMonth.getFullYear();

  // Generate days in month
  const firstDayIndex = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), 1).getDay();
  const totalDays = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 0).getDate();

  const handlePrevMiniMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1));
  };

  const handleNextMiniMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1));
  };

  const formattedMainDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="relative flex items-center justify-between px-6 py-4 border-b border-[#e5dcd0] bg-[#faf6ee] select-none">
      {/* Top Left: Mini Month Calendar & Handwritten Quote */}
      <div className="flex items-center gap-5">
        {/* Mini Calendar Widget (Matching image.png) */}
        <div className="hidden md:flex flex-col p-2.5 bg-white/80 rounded-xl border border-[#e0d6c5] shadow-2xs">
          {/* Month Header */}
          <div className="flex items-center justify-between gap-1 mb-1 text-[11px] font-medium text-[#4a3f33]">
            <button
              type="button"
              onClick={handlePrevMiniMonth}
              className="p-0.5 hover:bg-[#f0e7dc] rounded text-[#7d6f5e]"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-serif font-bold text-xs">
              {monthName} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMiniMonth}
              className="p-0.5 hover:bg-[#f0e7dc] rounded text-[#7d6f5e]"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-[#8a7c6b] mb-0.5">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-mono">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="w-4 h-4" />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                currentDate.getDate() === dayNum &&
                currentDate.getMonth() === miniCalMonth.getMonth() &&
                currentDate.getFullYear() === miniCalMonth.getFullYear();

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => {
                    const newD = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), dayNum);
                    onSelectDate(newD);
                  }}
                  className={`w-4 h-4 flex items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? 'bg-[#2b585e] text-white font-bold shadow-xs scale-110'
                      : 'text-[#383027] hover:bg-[#ebdcc8]'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inspirational Handwritten Quote with Botanical Leaf (Matching image.png) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex flex-col">
            <p className="font-hand text-xl text-[#3b3228] font-bold tracking-wide -rotate-1 leading-tight">
              "A productive day is<br />a happier day."
            </p>
          </div>

          {/* Botanical leaf sprig */}
          <svg className="w-6 h-10 text-[#607e5b] opacity-85" viewBox="0 0 20 32" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 30 C10 18 10 10 10 2" strokeLinecap="round" />
            <path d="M10 20 C6 18 4 15 5 12 C8 13 10 17 10 20 Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M10 14 C14 12 16 9 15 6 C12 7 10 11 10 14 Z" fill="currentColor" fillOpacity="0.25" />
            <circle cx="10" cy="3" r="1.5" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Top Center: Date Title Navigation & Cursive Day Name */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrevDay}
            title="Previous Day"
            className="p-1 rounded-full text-[#6b5d4f] hover:text-[#1c1917] hover:bg-[#ece2d4] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1c1917]">
            {formattedMainDate}
          </h2>

          <button
            type="button"
            onClick={onNextDay}
            title="Next Day"
            className="p-1 rounded-full text-[#6b5d4f] hover:text-[#1c1917] hover:bg-[#ece2d4] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cursive Day of the Week */}
        <span className="font-hand text-2xl text-[#6b5847] font-bold -mt-1 tracking-wide">
          {getDayName(currentDate)}
        </span>
      </div>

      {/* Top Right: Daily / Weekly Pills, Search, User Avatar with Dropdown */}
      <div className="flex items-center gap-3">
        {/* Handwritten note at top right matching image.png */}
        <div className="hidden xl:block text-right pr-2">
          <span className="font-hand text-base text-[#615447] font-bold rotate-2 inline-block">
            "Small steps<br />make big progress."
          </span>
        </div>

        {/* Daily / Weekly View Pills */}
        <div className="flex items-center p-1 bg-[#ede4d8] rounded-xl border border-[#dfd4c5] shadow-2xs">
          <button
            type="button"
            onClick={() => onToggleView('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all ${
              viewMode === 'daily'
                ? 'bg-[#faece6] text-[#2b2019] shadow-xs'
                : 'text-[#6e6050] hover:text-[#221e1a]'
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onToggleView('weekly')}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all ${
              viewMode === 'weekly'
                ? 'bg-[#faece6] text-[#2b2019] shadow-xs'
                : 'text-[#6e6050] hover:text-[#221e1a]'
            }`}
          >
            Weekly
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={isSoundEnabled ? 'Paper audio enabled' : 'Muted'}
          className="p-1.5 rounded-lg text-[#6e6050] hover:text-[#221e1a] hover:bg-[#ede4d8] transition-colors"
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#8b5e3c]" /> : <VolumeX className="w-4 h-4 text-[#998877]" />}
        </button>

        {/* User Profile or Sign In Button */}
        {currentUser ? (
          <button
            type="button"
            onClick={onOpenUserModal}
            title={`Active User: ${currentUser.name} (Click to manage account or log out)`}
            className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full hover:bg-[#ede4d8] border border-[#dfd4c5] transition-all group shadow-2xs"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#bdafa0] shadow-2xs group-hover:scale-105 transition-transform"
            />
            <span className="hidden md:inline font-serif text-xs font-bold text-[#221e1a]">
              {currentUser.name}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenUserModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8b5e3c] hover:bg-[#724b2f] text-white text-xs font-serif font-semibold shadow-xs transition-all"
            title="Sign in or create account to save your tasks"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
