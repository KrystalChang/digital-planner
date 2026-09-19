import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  BookOpen
} from 'lucide-react';
import { TodoItem, CalendarEvent } from '../types';
import { 
  getWeekDays, 
  formatDateKey, 
  getDayName, 
  getShortMonthDay, 
  calculateDayProgress, 
  isToday 
} from '../utils/dateUtils';
import { TodoItemRow } from './TodoItemRow';
import { soundManager } from '../utils/soundEffects';
import { getOccurringEventsForDate } from '../utils/recurrenceUtils';

interface WeeklyViewProps {
  baseDate: Date;
  todos: TodoItem[];
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
  onToggleTodo: (id: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSwitchToDaily: () => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  baseDate,
  todos,
  events,
  onSelectDay,
  onToggleTodo,
  onPrevWeek,
  onNextWeek,
  onSwitchToDaily
}) => {
  const weekDays = getWeekDays(baseDate);
  const leftPageDays = weekDays.slice(0, 3); // Mon, Tue, Wed
  const rightPageDays = weekDays.slice(3);   // Thu, Fri, Sat, Sun

  const weekStartStr = getShortMonthDay(weekDays[0]);
  const weekEndStr = getShortMonthDay(weekDays[6]);
  const year = weekDays[0].getFullYear();

  const handleDayClick = (day: Date) => {
    soundManager.playPageTurn();
    onSelectDay(day);
  };

  const renderDaySection = (day: Date, isWeekend = false) => {
    const key = formatDateKey(day);
    const dayTodos = todos.filter((t) => t.date === key);
    const dayEvents = getOccurringEventsForDate(events, key);
    const progress = calculateDayProgress(dayTodos);
    const isCurrentDay = isToday(day);

    return (
      <div
        key={key}
        id={`weekly-day-${key}`}
        className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 group ${
          isCurrentDay 
            ? 'bg-[#ffffff] border-[#8b5e3c] shadow-sm ring-1 ring-[#8b5e3c]/20' 
            : 'bg-[#faf7f2] border-[#e5dcce] hover:border-[#bdafa0] hover:bg-[#ffffff]'
        }`}
      >
        {/* Day Header with jump action */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ece2d4]">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-lg font-bold text-[#1c1917]">
              {getDayName(day)}
            </h3>
            <span className="font-hand text-base font-bold text-[#695c4d]">
              {getShortMonthDay(day)}
            </span>
            {isCurrentDay && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-[#8b5e3c] text-[#faf6ee]">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {progress.total > 0 && (
              <span className="text-xs font-mono font-bold text-[#3d342a] bg-[#ede6da] px-2 py-0.5 rounded-full">
                {progress.completed}/{progress.total}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleDayClick(day)}
              title="Open in Daily Planner view"
              className="flex items-center gap-1 text-xs font-serif font-bold text-[#8b5e3c] hover:text-[#52331c] hover:underline"
            >
              <span>Daily View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Calendar Events Mini-block */}
        {dayEvents.length > 0 && (
          <div className="mb-2.5 space-y-1">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#5c5043] font-bold block">
              Events ({dayEvents.length})
            </span>
            <div className="space-y-1">
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#f4eee4] border border-[#dfd2c1] text-xs text-[#241d17]"
                >
                  <span className="truncate font-medium font-serif font-semibold">{evt.title}</span>
                  <span className="text-[11px] font-mono font-bold text-[#5c5042] shrink-0 ml-2">
                    {evt.startTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todo List for this Day: with live checkboxes and strikethroughs */}
        <div className="flex-1 space-y-1.5">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#5c5043] font-bold block">
            Tasks {progress.total > 0 ? `(${progress.total})` : ''}
          </span>

          {dayTodos.length === 0 ? (
            <div className="py-2 text-xs text-[#8c7e6e] italic font-serif">
              No tasks scheduled
            </div>
          ) : (
            dayTodos.map((todo) => (
              <TodoItemRow
                key={todo.id}
                item={todo}
                onToggle={onToggleTodo}
              />
            ))
          )}
        </div>

        {/* Bottom progress bar */}
        {progress.total > 0 && (
          <div className="mt-3 pt-2 border-t border-[#ede6da]">
            <div className="w-full bg-[#ede6da] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#527c65] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="weekly-planner-spread" className="flex flex-col h-full w-full bg-[#fbf8f3] select-none">
      {/* Top Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#e5dcd0] bg-[#faf6ee]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8b5e3c]" />
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1c1917]">
              Weekly Planner Spread
            </h2>
          </div>
          <p className="font-sans text-xs text-[#6e6050] font-medium tracking-wide mt-0.5">
            {weekStartStr} – {weekEndStr}, {year}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#cfc2b0] rounded-lg overflow-hidden bg-white shadow-2xs">
            <button
              id="prev-week-btn"
              type="button"
              onClick={onPrevWeek}
              title="Previous Week"
              className="px-3 py-1.5 hover:bg-[#ede5d8] text-[#3d3328] transition-colors flex items-center gap-1 text-xs font-serif font-bold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Week</span>
            </button>
            <div className="w-[1px] h-4 bg-[#e5dcd0]" />
            <button
              id="next-week-btn"
              type="button"
              onClick={onNextWeek}
              title="Next Week"
              className="px-3 py-1.5 hover:bg-[#ede5d8] text-[#3d3328] transition-colors flex items-center gap-1 text-xs font-serif font-bold"
            >
              <span>Next Week</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="view-switch-daily-btn"
            type="button"
            onClick={onSwitchToDaily}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#c4b7a4] bg-[#2b221a] hover:bg-[#18130e] text-[#faf6ee] font-serif text-xs font-bold transition-all shadow-xs"
          >
            <span>Switch to Daily View</span>
          </button>
        </div>
      </div>

      {/* Two-page spread container */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 relative">
          {/* Vertical Book Spine Center Shadow on Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#d6cbbd] to-transparent -translate-x-1/2 pointer-events-none shadow-[0_0_12px_rgba(40,30,20,0.15)]" />

          {/* Left Page: Monday, Tuesday, Wednesday */}
          <div className="flex flex-col gap-4 bg-[#f8f5ee]/80 p-4 rounded-xl border border-[#e4dcce] book-spine-left">
            <div className="flex items-center justify-between pb-1 border-b border-[#e6decf]">
              <span className="font-serif font-bold italic text-xs text-[#6e6050]">
                Left Page — Mon • Tue • Wed
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {leftPageDays.map((day) => renderDaySection(day))}
            </div>
          </div>

          {/* Right Page: Thursday, Friday, Saturday, Sunday */}
          <div className="flex flex-col gap-4 bg-[#f8f5ee]/80 p-4 rounded-xl border border-[#e4dcce] book-spine-right">
            <div className="flex items-center justify-between pb-1 border-b border-[#e6decf]">
              <span className="font-serif font-bold italic text-xs text-[#6e6050]">
                Right Page — Thu • Fri • Sat • Sun
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {renderDaySection(rightPageDays[0])}
              {renderDaySection(rightPageDays[1])}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderDaySection(rightPageDays[2], true)}
                {renderDaySection(rightPageDays[3], true)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
