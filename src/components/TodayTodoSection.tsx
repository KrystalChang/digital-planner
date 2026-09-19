import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  X,
  Clover
} from 'lucide-react';
import { TodoItem, CalendarEvent, Priority } from '../types';
import { calculateDayProgress, timeToMinutes } from '../utils/dateUtils';
import { TodoItemRow } from './TodoItemRow';
import { soundManager } from '../utils/soundEffects';

interface TodayTodoSectionProps {
  dateStr: string;
  todos: TodoItem[];
  events: CalendarEvent[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'userId'>) => void;
  onDeleteTodo: (id: string) => void;
  onScheduleTodo: (todo: TodoItem) => void;
  onAutoSchedule?: () => void;
}

export const TodayTodoSection: React.FC<TodayTodoSectionProps> = ({
  dateStr,
  todos,
  events,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onScheduleTodo,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDeadline, setNewDeadline] = useState<string>('');

  const dayTodos = todos.filter((t) => t.date === dateStr);
  const dayEvents = events.filter((e) => e.date === dateStr);

  const progress = calculateDayProgress(dayTodos);
  const allDone = progress.total > 0 && progress.completed === progress.total;

  // Calculate free time between 08:00 and 20:00 (12 hours = 720 minutes)
  const totalBusyMins = dayEvents.reduce((acc, evt) => {
    const s = Math.max(8 * 60, timeToMinutes(evt.startTime));
    const e = Math.min(20 * 60, timeToMinutes(evt.endTime));
    return acc + Math.max(0, e - s);
  }, 0);
  const freeMins = Math.max(0, 720 - totalBusyMins);
  const freeHours = (freeMins / 60).toFixed(1);

  // Productivity rating
  const getProductivity = () => {
    if (progress.total === 0) return 'Relaxed';
    if (progress.percent >= 70) return 'Good';
    if (progress.percent >= 40) return 'Steady';
    return 'Starting';
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundManager.playCheckTick();
    onAddTodo({
      title: newTitle.trim(),
      date: dateStr,
      completed: false,
      estimatedDuration: Number(newDuration) || 30,
      priority: newPriority,
      deadline: newDeadline || undefined
    });

    setNewTitle('');
    setNewDeadline('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbf9f5] border-l border-[#e8ded0] p-4 sm:p-5 select-none overflow-y-auto">
      {/* Top Header: Today's Todo */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-2xl font-bold text-[#1c1917] tracking-tight">
          Today's Todo
        </h3>
      </div>

      {/* Progress Bar Header matching image.png: 5 / 7 completed   [======]  71% */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-sans text-xs font-bold text-[#24201c] whitespace-nowrap">
          {progress.completed} / {progress.total} completed
        </span>

        {/* Sage green smooth progress bar */}
        <div className="flex-1 h-2 bg-[#e8decb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#527c65] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <span className="font-mono text-xs font-bold text-[#24201c]">
          {progress.percent}%
        </span>
      </div>

      {/* Add New Task Button / Card (matching image.png) */}
      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full mb-3 py-2.5 px-4 bg-[#faeee9] hover:bg-[#f6e4dc] border border-[#f2d8cd] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#8b4332] shadow-2xs transition-all hover:scale-[1.005] active:scale-[0.995]"
        >
          <div className="p-0.5 rounded-full bg-[#e86f56] text-white">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Add a new task...</span>
        </button>
      ) : (
        /* Inline Quick Add Form */
        <form
          onSubmit={handleCreate}
          className="mb-3 p-3.5 bg-white rounded-xl border border-[#d8ccbc] shadow-xs space-y-2.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3d3227] uppercase tracking-wider">
              New Todo Item
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#8a7c6c] hover:text-[#221e1a]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Finish AI report, Read research paper..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#faf7f2] border border-[#d0c4b3] rounded-lg text-xs font-medium text-[#1c1917] placeholder-[#9c8e7e] focus:outline-none focus:border-[#8b5e3c]"
          />

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <label className="text-[10px] text-[#6e6050] font-semibold block mb-0.5">Duration</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-2 py-1 bg-[#faf7f2] border border-[#d0c4b3] rounded text-xs font-medium text-[#2b241e]"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hr</option>
                <option value={90}>1.5 hr</option>
                <option value={120}>2 hr</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#6e6050] font-semibold block mb-0.5">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full px-2 py-1 bg-[#faf7f2] border border-[#d0c4b3] rounded text-xs font-medium text-[#2b241e]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#6e6050] font-semibold block mb-0.5">Due Time</label>
              <input
                type="time"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-1.5 py-0.5 bg-[#faf7f2] border border-[#d0c4b3] rounded text-xs font-mono text-[#2b241e]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-[#635546] hover:bg-[#f0e7dc] rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-[#2b221a] hover:bg-[#18130e] text-[#faf6ee] rounded text-xs font-semibold shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Todo Items List */}
      <div className="space-y-2 mb-4 flex-1">
        {dayTodos.length === 0 ? (
          <div className="py-8 text-center text-[#8e8172]">
            <p className="font-serif italic text-sm">No tasks for today yet.</p>
            <p className="font-sans text-xs text-[#a69989] mt-0.5">
              Click "Add a new task..." to begin your day.
            </p>
          </div>
        ) : (
          dayTodos.map((item) => (
            <TodoItemRow
              key={item.id}
              item={item}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
              onSchedule={onScheduleTodo}
            />
          ))
        )}
      </div>

      {/* Celebration Card matching image.png */}
      {allDone && (
        <div className="mb-4 p-4 rounded-2xl bg-[#eaf3eb] border border-[#cde0d0] flex items-center gap-3 shadow-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 rounded-full bg-[#d6ebd8] text-[#3e724b] shrink-0">
            <Clover className="w-6 h-6 fill-[#3e724b]" />
          </div>
          <div>
            <h4 className="font-hand text-2xl text-[#2b5e39] font-bold leading-tight">
              All done for today!
            </h4>
            <p className="font-serif italic text-xs text-[#456b4f] mt-0.5">
              You showed up. That's enough. 💚
            </p>
          </div>
        </div>
      )}

      {/* "Today at a glance" section (Matching image.png!) */}
      <div className="mt-auto pt-3 border-t border-[#e8ded0]">
        <h4 className="font-serif font-bold text-sm text-[#1c1917] mb-2.5">
          Today at a glance
        </h4>

        <div className="grid grid-cols-4 gap-2">
          {/* Events Card */}
          <div className="p-2.5 bg-white rounded-xl border border-[#e2d6c6] shadow-2xs flex flex-col justify-between">
            <Calendar className="w-3.5 h-3.5 text-[#736453] mb-1" />
            <div>
              <span className="block font-serif font-bold text-base text-[#1c1917] leading-none">
                {dayEvents.length}
              </span>
              <span className="text-[10px] text-[#786a5b] font-medium mt-0.5 block">
                Events
              </span>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="p-2.5 bg-white rounded-xl border border-[#e2d6c6] shadow-2xs flex flex-col justify-between">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#527c65] mb-1" />
            <div>
              <span className="block font-serif font-bold text-base text-[#1c1917] leading-none">
                {progress.completed}/{progress.total}
              </span>
              <span className="text-[10px] text-[#786a5b] font-medium mt-0.5 block">
                Tasks
              </span>
            </div>
          </div>

          {/* Free Time Card */}
          <div className="p-2.5 bg-white rounded-xl border border-[#e2d6c6] shadow-2xs flex flex-col justify-between">
            <Clock className="w-3.5 h-3.5 text-[#8b5e3c] mb-1" />
            <div>
              <span className="block font-serif font-bold text-base text-[#1c1917] leading-none">
                {freeHours} h
              </span>
              <span className="text-[10px] text-[#786a5b] font-medium mt-0.5 block">
                Free Time
              </span>
            </div>
          </div>

          {/* Productivity Card */}
          <div className="p-2.5 bg-white rounded-xl border border-[#e2d6c6] shadow-2xs flex flex-col justify-between">
            <BarChart2 className="w-3.5 h-3.5 text-[#2b585e] mb-1" />
            <div>
              <span className="block font-serif font-bold text-base text-[#1c1917] leading-none">
                {getProductivity()}
              </span>
              <span className="text-[10px] text-[#786a5b] font-medium mt-0.5 block">
                Productivity
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
