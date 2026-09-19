import { CalendarEvent, EventRecurrence } from '../types';

function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Checks if a calendar event occurs on the specified date string (YYYY-MM-DD).
 */
export function isEventOccurringOnDate(event: CalendarEvent, targetDateStr: string): boolean {
  if (event.date === targetDateStr) {
    return true;
  }

  if (!event.recurrence || event.recurrence.frequency === 'none') {
    return false;
  }

  if (targetDateStr < event.date) {
    return false;
  }

  if (event.recurrence.until && targetDateStr > event.recurrence.until) {
    return false;
  }

  const startD = parseDateKey(event.date);
  const targetD = parseDateKey(targetDateStr);

  const freq = event.recurrence.frequency;
  const interval = Math.max(1, event.recurrence.interval || 1);

  if (freq === 'daily') {
    const diffTime = targetD.getTime() - startD.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % interval === 0;
  }

  if (freq === 'weekdays') {
    const dayOfWeek = targetD.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (freq === 'weekly') {
    const targetDayOfWeek = targetD.getDay();
    const allowedDays = event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.length > 0
      ? event.recurrence.daysOfWeek
      : [startD.getDay()];

    if (!allowedDays.includes(targetDayOfWeek)) {
      return false;
    }

    // Check week interval
    // Calculate week start for both (Sunday as start)
    const startWeekD = new Date(startD);
    startWeekD.setDate(startD.getDate() - startD.getDay());
    startWeekD.setHours(0, 0, 0, 0);

    const targetWeekD = new Date(targetD);
    targetWeekD.setDate(targetD.getDate() - targetD.getDay());
    targetWeekD.setHours(0, 0, 0, 0);

    const weekDiff = Math.round((targetWeekD.getTime() - startWeekD.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return weekDiff >= 0 && weekDiff % interval === 0;
  }

  if (freq === 'monthly') {
    if (targetD.getDate() !== startD.getDate()) {
      return false;
    }
    const monthDiff = (targetD.getFullYear() - startD.getFullYear()) * 12 + (targetD.getMonth() - startD.getMonth());
    return monthDiff >= 0 && monthDiff % interval === 0;
  }

  return false;
}

/**
 * Returns all events occurring on a target date, generating cloned occurrences
 * for recurring events so that they display correctly at target date.
 */
export function getOccurringEventsForDate(events: CalendarEvent[], targetDateStr: string): CalendarEvent[] {
  const result: CalendarEvent[] = [];
  for (const evt of events) {
    if (isEventOccurringOnDate(evt, targetDateStr)) {
      if (evt.date === targetDateStr) {
        result.push(evt);
      } else {
        // Cloned recurring instance for this day
        result.push({
          ...evt,
          date: targetDateStr,
        });
      }
    }
  }
  return result;
}

/**
 * Generates human readable recurrence summary description.
 */
export function getRecurrenceSummary(recurrence?: EventRecurrence, startDateStr?: string): string {
  if (!recurrence || recurrence.frequency === 'none') {
    return 'Does not repeat';
  }

  const interval = recurrence.interval || 1;
  const startD = startDateStr ? parseDateKey(startDateStr) : new Date();
  const dayName = DAY_NAMES[startD.getDay()];

  switch (recurrence.frequency) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    case 'weekdays':
      return 'Every weekday (Monday to Friday)';
    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const names = recurrence.daysOfWeek.map((d) => DAY_NAMES[d].slice(0, 3)).join(', ');
        return interval === 1 ? `Weekly on ${names}` : `Every ${interval} weeks on ${names}`;
      }
      return interval === 1 ? `Weekly on ${dayName}` : `Every ${interval} weeks on ${dayName}`;
    case 'monthly':
      return interval === 1 ? `Monthly on day ${startD.getDate()}` : `Every ${interval} months on day ${startD.getDate()}`;
    default:
      return 'Custom recurrence';
  }
}
