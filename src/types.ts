export type Priority = 'low' | 'medium' | 'high';

export type EventCategory = 
  | 'routine'
  | 'class'
  | 'meeting'
  | 'freetime'
  | 'research'
  | 'gym'
  | 'social'
  | 'focus'
  | 'work'
  | 'personal';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tagline?: string;
  role?: string;
}

export interface TodoItem {
  id: string;
  userId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  estimatedDuration: number; // in minutes (15, 30, 45, 60, 90, 120)
  deadline?: string; // HH:mm format, e.g. "17:00"
  priority: Priority;
  category?: string;
  scheduledTime?: string; // e.g. "10:00" if placed on calendar timeline
  notes?: string;
}

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays';

export interface EventRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g. every 1 week, every 2 weeks
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  until?: string; // YYYY-MM-DD
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  category: EventCategory;
  annotation?: string; // handwritten note, e.g. "Good morning!", "Maybe lunch here?"
  todoId?: string; // linked todo if auto-scheduled or dragged
  notes?: string;
  recurrence?: EventRecurrence;
}

export type PlannerViewMode = 'daily' | 'weekly';

export type PageFlipDirection = 'next' | 'prev' | 'jump';

export interface DayProgress {
  total: number;
  completed: number;
  percent: number;
}
