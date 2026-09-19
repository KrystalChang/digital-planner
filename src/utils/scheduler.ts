import { CalendarEvent, TodoItem } from '../types';
import { timeToMinutes, minutesToTime } from './dateUtils';

interface FreeSlot {
  start: number; // in minutes from midnight
  end: number;
}

export interface AutoScheduleResult {
  newEvents: CalendarEvent[];
  updatedTodos: TodoItem[];
  scheduledCount: number;
  unresolvedCount: number;
  summary: string;
}

export function autoScheduleDay(
  dateStr: string,
  todos: TodoItem[],
  existingEvents: CalendarEvent[],
  dayStartHour = 8, // 08:00
  dayEndHour = 20    // 20:00
): AutoScheduleResult {
  const dayStartMins = dayStartHour * 60;
  const dayEndMins = dayEndHour * 60;

  // Filter for pending, unscheduled todos for this specific date
  const candidateTodos = todos.filter(
    t => t.date === dateStr && !t.completed && !t.scheduledTime
  );

  if (candidateTodos.length === 0) {
    return {
      newEvents: [],
      updatedTodos: [],
      scheduledCount: 0,
      unresolvedCount: 0,
      summary: 'All tasks are already scheduled or completed!'
    };
  }

  // Sort candidate todos:
  // 1. High priority first
  // 2. Earlier deadline first
  // 3. Shorter duration first
  const priorityScore = { high: 3, medium: 2, low: 1 };
  const sortedTodos = [...candidateTodos].sort((a, b) => {
    const pDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (pDiff !== 0) return pDiff;

    if (a.deadline && b.deadline) {
      return timeToMinutes(a.deadline) - timeToMinutes(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    return a.estimatedDuration - b.estimatedDuration;
  });

  // Calculate busy intervals from existing events on this date
  const eventsOnDate = existingEvents.filter(e => e.date === dateStr);
  const busyIntervals = eventsOnDate
    .map(e => ({
      start: timeToMinutes(e.startTime),
      end: timeToMinutes(e.endTime)
    }))
    .sort((a, b) => a.start - b.start);

  // Merge overlapping busy intervals
  const mergedBusy: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...interval });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedBusy.push({ ...interval });
      }
    }
  }

  // Find free slots
  const freeSlots: FreeSlot[] = [];
  let currentPointer = dayStartMins;

  for (const busy of mergedBusy) {
    if (busy.start > currentPointer) {
      freeSlots.push({
        start: currentPointer,
        end: Math.min(busy.start, dayEndMins)
      });
    }
    currentPointer = Math.max(currentPointer, busy.end);
  }

  if (currentPointer < dayEndMins) {
    freeSlots.push({
      start: currentPointer,
      end: dayEndMins
    });
  }

  const newEvents: CalendarEvent[] = [];
  const updatedTodos: TodoItem[] = [];
  let scheduledCount = 0;

  for (const todo of sortedTodos) {
    const duration = todo.estimatedDuration || 30;
    const deadlineMins = todo.deadline ? timeToMinutes(todo.deadline) : null;

    // Find the first free slot that can accommodate this task
    let allocated = false;

    for (let i = 0; i < freeSlots.length; i++) {
      const slot = freeSlots[i];
      const potentialEnd = slot.start + duration;

      // Check if it fits in this slot
      if (potentialEnd <= slot.end) {
        // If there is a deadline, ensure it finishes before or at deadline
        if (deadlineMins && potentialEnd > deadlineMins) {
          continue; // Try next or skip if past deadline
        }

        const startTimeStr = minutesToTime(slot.start);
        const endTimeStr = minutesToTime(potentialEnd);

        // Create new calendar event
        const newEvent: CalendarEvent = {
          id: `sched-${todo.id}-${Date.now()}`,
          title: todo.title,
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          category: todo.priority === 'high' ? 'focus' : 'work',
          todoId: todo.id,
          notes: `Auto-scheduled (${duration}m)`
        };

        newEvents.push(newEvent);

        // Update Todo
        updatedTodos.push({
          ...todo,
          scheduledTime: startTimeStr
        });

        // Shrink or adjust the free slot with a 10-minute mindful buffer
        const buffer = 10;
        const newSlotStart = potentialEnd + buffer;
        if (newSlotStart < slot.end) {
          slot.start = newSlotStart;
        } else {
          freeSlots.splice(i, 1);
        }

        scheduledCount++;
        allocated = true;
        break;
      }
    }

    // Fallback: If strict deadline check failed, try to schedule in any available slot anyway
    if (!allocated && deadlineMins) {
      for (let i = 0; i < freeSlots.length; i++) {
        const slot = freeSlots[i];
        const potentialEnd = slot.start + duration;
        if (potentialEnd <= slot.end) {
          const startTimeStr = minutesToTime(slot.start);
          const endTimeStr = minutesToTime(potentialEnd);

          const newEvent: CalendarEvent = {
            id: `sched-${todo.id}-${Date.now()}`,
            title: todo.title,
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            category: 'work',
            todoId: todo.id,
            notes: `Auto-scheduled (${duration}m)`
          };

          newEvents.push(newEvent);
          updatedTodos.push({
            ...todo,
            scheduledTime: startTimeStr
          });

          const buffer = 10;
          const newSlotStart = potentialEnd + buffer;
          if (newSlotStart < slot.end) {
            slot.start = newSlotStart;
          } else {
            freeSlots.splice(i, 1);
          }
          scheduledCount++;
          allocated = true;
          break;
        }
      }
    }
  }

  const unresolvedCount = sortedTodos.length - scheduledCount;
  let summary = `Scheduled ${scheduledCount} task${scheduledCount === 1 ? '' : 's'} into available calendar gaps.`;
  if (unresolvedCount > 0) {
    summary += ` (${unresolvedCount} task${unresolvedCount === 1 ? '' : 's'} could not fit into remaining slots).`;
  }

  return {
    newEvents,
    updatedTodos,
    scheduledCount,
    unresolvedCount,
    summary
  };
}
