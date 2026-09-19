import { TodoItem, DayProgress } from '../types';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWeekDays(baseDate: Date): Date[] {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day; // Monday as first day of planner week

  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

export function getFriendlyDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getShortMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getDayShortName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(dateInput: Date | string): boolean {
  const d = typeof dateInput === 'string' ? parseDateKey(dateInput) : dateInput;
  const today = new Date();
  return isSameDay(d, today);
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateDayProgress(todos: TodoItem[]): DayProgress {
  const total = todos.length;
  if (total === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }
  const completed = todos.filter(t => t.completed).length;
  const percent = Math.round((completed / total) * 100);
  return { total, completed, percent };
}

// Generate an ASCII/block progress representation like: Today  ███████░░  5 / 7
export function formatBlockProgress(completed: number, total: number, blocks = 10): string {
  if (total === 0) return '░'.repeat(blocks);
  const filled = Math.min(blocks, Math.round((completed / total) * blocks));
  const empty = blocks - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
