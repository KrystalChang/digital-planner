import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface JournalDeskFrameProps {
  selectedMonthTab: string;
  onSelectMonthTab: (tab: string) => void;
  currentYear?: number;
  onPrevYear?: () => void;
  onNextYear?: () => void;
  children: React.ReactNode;
}

const ALL_MONTH_TABS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export const JournalDeskFrame: React.FC<JournalDeskFrameProps> = ({
  selectedMonthTab,
  onSelectMonthTab,
  currentYear = 2025,
  onPrevYear,
  onNextYear,
  children
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#bfb29f] text-[#221e1a] flex p-2 sm:p-4 lg:p-6 select-none overflow-x-hidden font-sans justify-center">
      {/* Realistic desk background texture & ambient lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 70%),
            radial-gradient(#9c8a77 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px'
        }}
      />

      {/* Decorative botanical branch at top left (matching design aesthetic) */}
      <div className="absolute -top-3 -left-3 w-32 h-44 pointer-events-none z-10 opacity-80 hidden md:block">
        <svg viewBox="0 0 100 140" fill="none" className="w-full h-full text-[#4e6849]">
          <path d="M0 0 C40 40 70 80 85 130" stroke="#364d33" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M25 25 C45 15 65 20 60 40 C45 45 35 35 25 25 Z" fill="#587452" opacity="0.85" />
          <path d="M45 55 C65 45 85 55 80 75 C60 80 50 68 45 55 Z" fill="#63805d" opacity="0.9" />
          <path d="M65 85 C85 80 98 95 90 115 C75 118 68 100 65 85 Z" fill="#516d4d" opacity="0.95" />
        </svg>
      </div>

      {/* Main Workspace: Centered Open Notebook Binder Container */}
      <div className="relative w-full max-w-[1360px] mx-auto flex items-stretch z-20">
        {/* The Open Journal Notebook with Leather Binder & Right 12-Month Tabs */}
        <div className="relative flex-1 flex items-stretch min-w-0">
          {/* Leather Binder Edge (with perimeter stitching) */}
          <div className="relative flex-1 flex flex-col rounded-3xl bg-[#524436] p-2.5 sm:p-3.5 shadow-[0_25px_60px_rgba(30,22,15,0.45),0_6px_12px_rgba(30,22,15,0.3)] border border-[#3d3227]">
            {/* Real perimeter stitching effect */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-2xl border border-dashed border-[#8c7865] pointer-events-none opacity-80" />

            {/* Paper Stack Inner Book */}
            <div className="relative flex-1 flex flex-col rounded-2xl bg-[#faf6ee] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] overflow-hidden border border-[#d8cdbc]">
              {children}
            </div>
          </div>

          {/* Right-side Full 12-Month Divider Tabs (JAN - DEC) with Year Control */}
          <div className="hidden sm:flex flex-col items-center gap-1 pt-6 -ml-1 z-30 shrink-0">
            {/* Year Selector Badge */}
            <div className="flex flex-col items-center bg-[#d4c3af] px-1 py-1.5 rounded-r-md border-y border-r border-[#bfae9c] shadow-2xs mb-1 text-[#3d3225]">
              {onPrevYear && (
                <button
                  type="button"
                  onClick={onPrevYear}
                  title="Previous Year"
                  className="p-0.5 hover:bg-[#ebdccc] rounded text-[#4d4032]"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="font-serif text-[10px] font-bold tracking-tight">
                {currentYear}
              </span>
              {onNextYear && (
                <button
                  type="button"
                  onClick={onNextYear}
                  title="Next Year"
                  className="p-0.5 hover:bg-[#ebdccc] rounded text-[#4d4032]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 12 Monthly Tabs */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-140px)] py-1">
              {ALL_MONTH_TABS.map((tab) => {
                const isSelected = selectedMonthTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onSelectMonthTab(tab)}
                    title={`View ${tab} ${currentYear}`}
                    className={`w-8 sm:w-9 py-2 rounded-r-lg font-serif text-[10px] sm:text-[11px] font-bold tracking-wider transition-all shadow-xs flex items-center justify-center [writing-mode:vertical-rl] ${
                      isSelected
                        ? 'bg-[#faf6ee] text-[#1c1917] pl-2 border-y border-r border-[#d4c8b6] -translate-x-0.5 shadow-md ring-1 ring-[#c2b29f]'
                        : 'bg-[#d8c8b6] hover:bg-[#e4d6c6] text-[#4a3e33] border-y border-r border-[#c2b29f] hover:translate-x-0.5'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vintage brass/gold fountain pen at bottom right (matching image.png) */}
      <div className="absolute -bottom-2 right-4 w-28 h-40 pointer-events-none z-10 opacity-85 hidden xl:block">
        <svg viewBox="0 0 80 160" fill="none" className="w-full h-full rotate-[-25deg] drop-shadow-md">
          {/* Pen Barrel */}
          <rect x="36" y="20" width="8" height="90" rx="4" fill="#c49b5c" />
          <rect x="37" y="22" width="6" height="86" fill="url(#goldGradient)" />
          {/* Grip & Nib */}
          <polygon points="36,110 44,110 40,140" fill="#2b231c" />
          <polygon points="38,130 42,130 40,148" fill="#e8c878" />
          <line x1="40" y1="130" x2="40" y2="145" stroke="#4a3b26" strokeWidth="0.8" />
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b38743" />
              <stop offset="50%" stopColor="#f5dd90" />
              <stop offset="100%" stopColor="#9e7332" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
