import React from 'react';
import { CalendarEvent, TodoItem } from '../types';
import { CalendarTimeline } from './CalendarTimeline';
import { TodayTodoSection } from './TodayTodoSection';

interface DailyViewProps {
  dateStr: string;
  todos: TodoItem[];
  events: CalendarEvent[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'userId'>) => void;
  onDeleteTodo: (id: string) => void;
  onScheduleTodo: (todo: TodoItem) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onUpdateEvent: (eventId: string, event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onDropTodoToTimeline: (todoId: string, startTime: string) => void;
  onAutoSchedule?: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  dateStr,
  todos,
  events,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onScheduleTodo,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onDropTodoToTimeline,
}) => {
  return (
    <div id="daily-planner-page" className="flex-1 flex flex-col md:flex-row h-full w-full bg-[#fdfbf7] overflow-hidden">
      {/* Left Column: Calendar Timeline (~58% desktop width) */}
      <div className="w-full md:w-[58%] lg:w-[57%] h-1/2 md:h-full flex flex-col border-b md:border-b-0 border-[#e8dfd2]">
        <CalendarTimeline
          dateStr={dateStr}
          events={events}
          todos={todos}
          onAddEvent={onAddEvent}
          onUpdateEvent={onUpdateEvent}
          onDeleteEvent={onDeleteEvent}
          onDropTodo={onDropTodoToTimeline}
        />
      </div>

      {/* Right Column: Today's Todo & At a Glance (~42% desktop width) */}
      <div className="w-full md:w-[42%] lg:w-[43%] h-1/2 md:h-full flex flex-col bg-[#fbf9f5]">
        <TodayTodoSection
          dateStr={dateStr}
          todos={todos}
          events={events}
          onToggleTodo={onToggleTodo}
          onAddTodo={onAddTodo}
          onDeleteTodo={onDeleteTodo}
          onScheduleTodo={onScheduleTodo}
        />
      </div>
    </div>
  );
};
