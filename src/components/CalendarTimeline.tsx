import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Coffee, 
  GraduationCap, 
  Users, 
  Sun, 
  FileText, 
  Dumbbell, 
  Utensils, 
  Briefcase,
  Edit2, 
  Trash2,
  CalendarPlus,
  Repeat
} from 'lucide-react';
import { CalendarEvent, TodoItem, EventCategory } from '../types';
import { timeToMinutes } from '../utils/dateUtils';
import { getOccurringEventsForDate, getRecurrenceSummary } from '../utils/recurrenceUtils';
import { soundManager } from '../utils/soundEffects';
import { EventModal } from './EventModal';

interface CalendarTimelineProps {
  dateStr: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onUpdateEvent: (eventId: string, event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onDropTodo: (todoId: string, startTime: string) => void;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  dateStr,
  events,
  todos,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onDropTodo
}) => {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [dragOverMinutes, setDragOverMinutes] = useState<number>(0);

  // Modal State for Adding / Editing events
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultStartTime, setModalDefaultStartTime] = useState('09:00');

  // Hours: 06:00 to 22:00 (matching image.png)
  const START_HOUR = 6;
  const END_HOUR = 22;
  const PIXELS_PER_HOUR = 56;
  const totalHours = END_HOUR - START_HOUR + 1;

  // Filter events for this specific day (including recurring events)
  const dayEvents = getOccurringEventsForDate(events, dateStr);

  const getCategoryMeta = (cat: EventCategory) => {
    switch (cat) {
      case 'routine':
        return {
          icon: <Coffee className="w-3.5 h-3.5 text-[#8b4d32]" />,
          bg: 'bg-[#fbeee8]',
          border: 'border-[#f2d0c2]',
          text: 'text-[#2b1e17]',
          subtext: 'text-[#695349]'
        };
      case 'class':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-[#255294]" />,
          bg: 'bg-[#e8f1fe]',
          border: 'border-[#c6dcfa]',
          text: 'text-[#162740]',
          subtext: 'text-[#476082]'
        };
      case 'meeting':
        return {
          icon: <Users className="w-3.5 h-3.5 text-[#2b6b3e]" />,
          bg: 'bg-[#eaf3eb]',
          border: 'border-[#cae3ce]',
          text: 'text-[#163321]',
          subtext: 'text-[#486b51]'
        };
      case 'freetime':
        return {
          icon: <Sun className="w-3.5 h-3.5 text-[#8f742f]" />,
          bg: 'bg-[#faf6ee] hatched-stripes',
          border: 'border-[#e4dac6]',
          text: 'text-[#382f1b]',
          subtext: 'text-[#70644b]'
        };
      case 'research':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-[#633b8a]" />,
          bg: 'bg-[#f1edf8]',
          border: 'border-[#dad0ec]',
          text: 'text-[#2b1d3b]',
          subtext: 'text-[#5d4b70]'
        };
      case 'gym':
        return {
          icon: <Dumbbell className="w-3.5 h-3.5 text-[#8c671b]" />,
          bg: 'bg-[#fef4dc]',
          border: 'border-[#f3dfa9]',
          text: 'text-[#3b2e10]',
          subtext: 'text-[#705e33]'
        };
      case 'social':
        return {
          icon: <Utensils className="w-3.5 h-3.5 text-[#215787]" />,
          bg: 'bg-[#e4f0fa]',
          border: 'border-[#c2ddf3]',
          text: 'text-[#14283b]',
          subtext: 'text-[#466580]'
        };
      default:
        return {
          icon: <Briefcase className="w-3.5 h-3.5 text-[#635547]" />,
          bg: 'bg-[#f4efe8]',
          border: 'border-[#ded4c5]',
          text: 'text-[#2a241e]',
          subtext: 'text-[#63594f]'
        };
    }
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isHalfHour = offsetY > rect.height / 2;
    const mins = isHalfHour ? 30 : 0;

    setDragOverHour(hour);
    setDragOverMinutes(mins);
  };

  const handleDragLeave = () => {
    setDragOverHour(null);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;

    let todoId = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.id) todoId = parsed.id;
    } catch {
      // raw was string ID
    }

    if (todoId) {
      const startTimeStr = `${String(hour).padStart(2, '0')}:${String(dragOverMinutes).padStart(2, '0')}`;
      soundManager.playCheckTick();
      onDropTodo(todoId, startTimeStr);
    }
    setDragOverHour(null);
  };

  const calculateTopAndHeight = (startTime: string, endTime: string) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const baseMins = START_HOUR * 60;

    const topPx = ((startMins - baseMins) / 60) * PIXELS_PER_HOUR;
    const heightPx = Math.max(34, ((endMins - startMins) / 60) * PIXELS_PER_HOUR);

    return { top: Math.max(0, topPx), height: heightPx };
  };

  const openAddModal = (hour?: number) => {
    setSelectedEvent(null);
    if (typeof hour === 'number') {
      setModalDefaultStartTime(`${String(hour).padStart(2, '0')}:00`);
    } else {
      setModalDefaultStartTime('09:00');
    }
    setIsModalOpen(true);
  };

  const openEditModal = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setIsModalOpen(true);
  };

  const handleSaveModal = (
    eventData: Omit<CalendarEvent, 'id' | 'userId'>,
    eventId?: string
  ) => {
    if (eventId) {
      onUpdateEvent(eventId, eventData);
    } else {
      onAddEvent(eventData);
    }
    soundManager.playCheckTick();
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#fdfbf7] select-none">
      {/* Timeline Header with Action */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e8dfd2] bg-[#f8f4ec]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8b5e3c]" />
          <span className="font-serif text-sm font-bold text-[#221e1a] tracking-wide">
            Schedule Timeline
          </span>
          <span className="text-xs font-mono text-[#5c5246] font-semibold ml-1">
            06:00 – 22:00
          </span>
        </div>

        {/* Real Functional Add Event Button */}
        <button
          type="button"
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#2b221a] hover:bg-[#18130e] text-[#faf6ee] rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Hourly Grid Scrollable Area */}
      <div className="relative flex-1 overflow-y-auto px-3 py-3">
        <div className="relative">
          {Array.from({ length: totalHours }).map((_, index) => {
            const hour = START_HOUR + index;
            const hourFormatted = `${String(hour).padStart(2, '0')}:00`;
            const isTarget = dragOverHour === hour;

            return (
              <div
                key={hour}
                id={`timeline-hour-${hour}`}
                onDragOver={(e) => handleDragOver(e, hour)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, hour)}
                onClick={() => openAddModal(hour)}
                className={`relative flex items-start group transition-colors duration-150 border-b border-[#ebe2d4] cursor-pointer ${
                  isTarget ? 'bg-[#f4ebe0]' : 'hover:bg-[#fcf7ee]'
                }`}
                style={{ height: `${PIXELS_PER_HOUR}px` }}
              >
                {/* Left Hour Label - Strong, High Contrast Typography */}
                <div className="w-14 flex-shrink-0 pr-3 text-right">
                  <span className="font-mono text-xs font-bold text-[#24201c] tracking-tight group-hover:text-[#8b5e3c]">
                    {hourFormatted}
                  </span>
                </div>

                {/* Slot Area */}
                <div className="flex-1 h-full border-l border-[#e4dccf] relative">
                  {/* Subtle 30-minute dashed guide line */}
                  <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-[#ede5d8] pointer-events-none" />

                  {/* Empty Slot Hover Prompt */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-y-1 right-3 flex items-center gap-1 text-[11px] text-[#7a6b5a] font-medium pointer-events-none">
                    <Plus className="w-3 h-3 text-[#8b5e3c]" />
                    <span>Click to add event</span>
                  </div>

                  {/* Drop Preview */}
                  {isTarget && (
                    <div
                      className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-[#8b5e3c] bg-[#faefe3]/95 px-3 py-1 flex items-center justify-between text-xs text-[#4a3420] pointer-events-none z-30 shadow-md"
                      style={{
                        top: `${dragOverMinutes === 30 ? 28 : 2}px`,
                        height: '42px'
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-semibold truncate">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Schedule here at {String(hour).padStart(2, '0')}:{String(dragOverMinutes).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-[11px] bg-[#ebd5c0] px-2 py-0.5 rounded font-mono font-bold">
                        Drop to Place
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Render Calendar Events positioned absolutely on top of timeline */}
          <div className="absolute top-0 left-14 right-2 pointer-events-none">
            {dayEvents.map((evt) => {
              const { top, height } = calculateTopAndHeight(evt.startTime, evt.endTime);
              const meta = getCategoryMeta(evt.category);
              const linkedTodo = evt.todoId ? todos.find((t) => t.id === evt.todoId) : undefined;

              return (
                <div
                  key={evt.id}
                  id={`event-block-${evt.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(evt);
                  }}
                  className={`pointer-events-auto absolute left-2 right-1 rounded-xl border ${meta.border} ${meta.bg} ${meta.text} px-3.5 py-2 shadow-[0_2px_6px_rgba(40,30,20,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(40,30,20,0.12)] hover:scale-[1.005] group overflow-hidden z-10 cursor-pointer`}
                  style={{
                    top: `${top + 2}px`,
                    height: `${height - 4}px`
                  }}
                >
                  <div className="flex items-center justify-between h-full w-full gap-2">
                    {/* Left: Icon, Title & Time */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-1 rounded-md bg-white/70 shadow-2xs shrink-0">
                        {meta.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm leading-tight truncate text-[#1c1917]">
                            {evt.title}
                          </h4>
                          {evt.recurrence && evt.recurrence.frequency !== 'none' && (
                            <span 
                              title={`Recurring: ${getRecurrenceSummary(evt.recurrence, evt.date)}`}
                              className="p-0.5 rounded bg-white/70 text-[#8b5e3c] shrink-0"
                            >
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                          {linkedTodo?.completed && (
                            <span className="text-[10px] bg-[#527c65] text-white px-1.5 py-0.2 rounded-full font-sans font-semibold shrink-0">
                              Done ✓
                            </span>
                          )}
                        </div>

                        <div className={`text-[11px] font-mono ${meta.subtext} mt-0.5 flex items-center gap-2`}>
                          <span className="font-semibold">{evt.startTime} – {evt.endTime}</span>
                          {evt.notes && height > 60 && (
                            <span className="truncate italic font-sans opacity-90 hidden sm:inline">
                              • {evt.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Handwritten Annotation Note (matching image.png!) */}
                    {evt.annotation && (
                      <div className="shrink-0 flex items-center pr-2">
                        <span className="font-hand text-lg text-[#69503d] font-bold tracking-wide -rotate-2 transform">
                          {evt.annotation}
                        </span>
                      </div>
                    )}

                    {/* Hover Actions: Edit & Delete */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 bg-white/80 p-1 rounded-lg backdrop-blur-xs shadow-2xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(evt);
                        }}
                        title="Edit Event"
                        className="p-1 text-[#5c5043] hover:text-[#221e1a] rounded hover:bg-[#e8ded0] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(evt.id);
                        }}
                        title="Delete Event"
                        className="p-1 text-[#a33927] hover:bg-[#fceae7] rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real In-App Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteEvent}
        initialEvent={selectedEvent}
        defaultDate={dateStr}
        defaultStartTime={modalDefaultStartTime}
      />
    </div>
  );
};
