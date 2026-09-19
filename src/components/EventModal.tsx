import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Coffee, 
  GraduationCap, 
  Users, 
  Sun, 
  FileText, 
  Dumbbell, 
  Utensils, 
  Briefcase, 
  Sparkles, 
  Trash2,
  Repeat
} from 'lucide-react';
import { CalendarEvent, EventCategory, EventRecurrence, RecurrenceFrequency } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'userId'>, eventId?: string) => void;
  onDelete?: (eventId: string) => void;
  initialEvent?: CalendarEvent | null;
  defaultDate: string;
  defaultStartTime?: string;
}

const WEEK_DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
  defaultStartTime = '09:00'
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('routine');
  const [annotation, setAnnotation] = useState('');
  const [notes, setNotes] = useState('');

  // Recurrence configuration state
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [recurrenceUntil, setRecurrenceUntil] = useState<string>('');
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setCategory(initialEvent.category);
      setAnnotation(initialEvent.annotation || '');
      setNotes(initialEvent.notes || '');

      if (initialEvent.recurrence && initialEvent.recurrence.frequency !== 'none') {
        setRecurrenceFreq(initialEvent.recurrence.frequency);
        setRecurrenceInterval(initialEvent.recurrence.interval || 1);
        setSelectedDaysOfWeek(initialEvent.recurrence.daysOfWeek || []);
        setRecurrenceUntil(initialEvent.recurrence.until || '');
        setHasEndDate(Boolean(initialEvent.recurrence.until));
      } else {
        setRecurrenceFreq('none');
        setRecurrenceInterval(1);
        setSelectedDaysOfWeek([]);
        setRecurrenceUntil('');
        setHasEndDate(false);
      }
    } else {
      setTitle('');
      setDate(defaultDate);
      setStartTime(defaultStartTime);
      // Auto-calculate end time 1 hour later
      const [h, m] = defaultStartTime.split(':').map(Number);
      const endH = Math.min(23, h + 1);
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      setCategory('routine');
      setAnnotation('');
      setNotes('');

      // Default non-repeating
      setRecurrenceFreq('none');
      setRecurrenceInterval(1);
      const dayIdx = new Date(defaultDate).getDay();
      setSelectedDaysOfWeek([isNaN(dayIdx) ? 1 : dayIdx]);
      setRecurrenceUntil('');
      setHasEndDate(false);
    }
  }, [initialEvent, defaultDate, defaultStartTime, isOpen]);

  if (!isOpen) return null;

  const [dateY, dateM, dateD] = date.split('-').map(Number);
  const currentEventDate = new Date(dateY, dateM - 1, dateD);
  const dayOfWeekName = DAY_NAMES[currentEventDate.getDay()] || 'Day';

  const categories: Array<{ id: EventCategory; label: string; icon: React.ReactNode; bg: string; border: string; text: string }> = [
    { id: 'routine', label: 'Routine', icon: <Coffee className="w-3.5 h-3.5" />, bg: 'bg-[#faebe5]', border: 'border-[#f2d3c7]', text: 'text-[#38261e]' },
    { id: 'class', label: 'Class / Study', icon: <GraduationCap className="w-3.5 h-3.5" />, bg: 'bg-[#e8f0fe]', border: 'border-[#c9dcfa]', text: 'text-[#1e293b]' },
    { id: 'meeting', label: 'Meeting', icon: <Users className="w-3.5 h-3.5" />, bg: 'bg-[#eaf2eb]', border: 'border-[#cce0ce]', text: 'text-[#1c3323]' },
    { id: 'freetime', label: 'Free Time', icon: <Sun className="w-3.5 h-3.5" />, bg: 'bg-[#fbf7ee]', border: 'border-[#e8dfc7]', text: 'text-[#473b22]' },
    { id: 'research', label: 'Research', icon: <FileText className="w-3.5 h-3.5" />, bg: 'bg-[#f0edf8]', border: 'border-[#d8cfec]', text: 'text-[#2d2438]' },
    { id: 'gym', label: 'Gym / Wellness', icon: <Dumbbell className="w-3.5 h-3.5" />, bg: 'bg-[#fdf4db]', border: 'border-[#f3e1b0]', text: 'text-[#3d3319]' },
    { id: 'social', label: 'Social / Food', icon: <Utensils className="w-3.5 h-3.5" />, bg: 'bg-[#e5f0fa]', border: 'border-[#c6def3]', text: 'text-[#192c3d]' },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-3.5 h-3.5" />, bg: 'bg-[#f2ece2]', border: 'border-[#ddcfbd]', text: 'text-[#362f27]' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let recurrence: EventRecurrence | undefined = undefined;
    if (recurrenceFreq !== 'none') {
      recurrence = {
        frequency: recurrenceFreq,
        interval: recurrenceInterval > 0 ? recurrenceInterval : 1,
        daysOfWeek: recurrenceFreq === 'weekly' && selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : [currentEventDate.getDay()],
        until: hasEndDate && recurrenceUntil ? recurrenceUntil : undefined
      };
    }

    onSave({
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      annotation: annotation.trim() || undefined,
      notes: notes.trim() || undefined,
      recurrence
    }, initialEvent?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div 
        className="w-full max-w-lg bg-[#faf7f2] rounded-2xl shadow-2xl border border-[#d8cdbd] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ded0] bg-[#f5ede2]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8b5e3c]" />
            <h3 className="font-serif text-lg font-bold text-[#221e1a]">
              {initialEvent ? 'Edit Calendar Event' : 'Add Calendar Event'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#6b5f52] hover:text-[#221e1a] hover:bg-[#e8ded0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#221e1a]">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Morning Routine, Team Meeting, Algorithms..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-sm text-[#1c1917] font-medium placeholder-[#998c7d] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/30 focus:border-[#8b5e3c]"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
              />
            </div>
          </div>

          {/* Recurrence Schedule */}
          <div className="bg-[#f5ede2]/70 p-3.5 rounded-xl border border-[#dfd2c0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3d342a] uppercase tracking-wider">
                <Repeat className="w-3.5 h-3.5 text-[#8b5e3c]" />
                <span>Repeat & Recurrence</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <select
                  value={recurrenceFreq}
                  onChange={(e) => {
                    const val = e.target.value as RecurrenceFrequency;
                    setRecurrenceFreq(val);
                    if (val === 'weekly' && selectedDaysOfWeek.length === 0) {
                      const dayIdx = currentEventDate.getDay();
                      setSelectedDaysOfWeek([isNaN(dayIdx) ? 1 : dayIdx]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs font-medium text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                >
                  <option value="none">Does not repeat</option>
                  <option value="weekly">{`Weekly on ${dayOfWeekName}`}</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Every weekday (Monday to Friday)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurrenceFreq !== 'none' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#594d3f]">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1.5 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs text-center font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                  />
                  <span className="text-xs text-[#594d3f]">
                    {recurrenceFreq === 'daily' ? 'day(s)' : recurrenceFreq === 'weekly' ? 'week(s)' : recurrenceFreq === 'monthly' ? 'month(s)' : 'days'}
                  </span>
                </div>
              )}
            </div>

            {/* Weekly Days Picker */}
            {recurrenceFreq === 'weekly' && (
              <div className="pt-2 border-t border-[#e6dac9]">
                <span className="block text-[11px] font-semibold text-[#594d3f] mb-1.5">Repeat on days:</span>
                <div className="flex items-center gap-1.5">
                  {WEEK_DAYS_SHORT.map((day, idx) => {
                    const isSelected = selectedDaysOfWeek.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDaysOfWeek((prev) =>
                            isSelected ? (prev.length > 1 ? prev.filter((d) => d !== idx) : prev) : [...prev, idx]
                          );
                        }}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#8b5e3c] text-white shadow-xs scale-105'
                            : 'bg-white text-[#6b5f52] border border-[#d6cbbe] hover:bg-[#eae0d2]'
                        }`}
                        title={DAY_NAMES[idx]}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional End Date */}
            {recurrenceFreq !== 'none' && (
              <div className="pt-2 border-t border-[#e6dac9] flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[#594d3f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="rounded text-[#8b5e3c] focus:ring-[#8b5e3c]"
                  />
                  <span>Ends on date</span>
                </label>
                {hasEndDate && (
                  <input
                    type="date"
                    value={recurrenceUntil}
                    onChange={(e) => setRecurrenceUntil(e.target.value)}
                    className="px-2.5 py-1 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1.5">
              Category & Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    cat.bg
                  } ${cat.border} ${cat.text} ${
                    category === cat.id
                      ? 'ring-2 ring-[#4a3e30] font-bold shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Handwritten Annotation Note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#3d342a] uppercase tracking-wider">
                Handwritten Note (Optional)
              </label>
              <span className="text-[11px] font-hand text-[#8b5e3c]">
                Appears in playful cursive on the schedule
              </span>
            </div>
            <input
              type="text"
              placeholder='e.g. "Good morning!", "Maybe lunch here?", "Good food, Good mood!"'
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs text-[#2c241c] font-hand text-base placeholder-[#a89c8e] focus:outline-none focus:border-[#8b5e3c]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#3d342a] uppercase tracking-wider mb-1">
              Details & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add locations, agendas, or reminder details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#ffffff] border border-[#cfc3b2] rounded-lg text-xs text-[#1c1917] placeholder-[#998c7d] focus:outline-none focus:border-[#8b5e3c]"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e8ded0]">
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialEvent.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#a33827] hover:bg-[#faeae7] rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#524639] hover:bg-[#ebe2d3] rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2d251e] hover:bg-[#1a1510] text-[#faf6ef] rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                {initialEvent ? 'Save Changes' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
