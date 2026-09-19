/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TodoItem, 
  CalendarEvent, 
  PlannerViewMode, 
  PageFlipDirection, 
  User 
} from './types';
import { getInitialPlannerData } from './data/initialData';
import { 
  formatDateKey, 
  addDays, 
  timeToMinutes, 
  minutesToTime 
} from './utils/dateUtils';
import { soundManager } from './utils/soundEffects';
import { JournalDeskFrame } from './components/JournalDeskFrame';
import { NotebookHeader } from './components/NotebookHeader';
import { DailyView } from './components/DailyView';
import { WeeklyView } from './components/WeeklyView';
import { PageTurnContainer } from './components/PageTurnContainer';
import { ToastNotification } from './components/ToastNotification';
import { UserManagementModal } from './components/UserManagementModal';
import { Sparkles, LogIn, Lock } from 'lucide-react';

const MONTH_INDEX_MAP: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
};

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function App() {
  // Current user: null by default (Demo Mode), or restored from session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('digital_planner_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.uid)) return parsed;
      }
    } catch {}
    return null;
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Automatically jump to today's date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedMonthTab, setSelectedMonthTab] = useState<string>(
    () => MONTH_NAMES[new Date().getMonth()]
  );

  // Planner content state (seeded with demo data for immediate preview)
  const initialFallback = getInitialPlannerData();
  const [todos, setTodos] = useState<TodoItem[]>(initialFallback.todos);
  const [events, setEvents] = useState<CalendarEvent[]>(initialFallback.events);

  const [viewMode, setViewMode] = useState<PlannerViewMode>('daily');
  const [flipDirection, setFlipDirection] = useState<PageFlipDirection>('next');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dateStr = formatDateKey(currentDate);

  // Fetch data for currentUser from backend database API
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/data`);
      if (res.ok) {
        const data = await res.json();
        if (data.todos) setTodos(data.todos);
        if (data.events) setEvents(data.events);
      }
    } catch (err) {
      console.warn('Using local state fallback for user data');
    }
  }, []);

  // When user is logged in, load their database records
  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    }
  }, [currentUser?.id, loadUserData]);

  // Auth gate check: require login/registration to modify planner
  const requireAuth = (actionDescription: string): boolean => {
    if (!currentUser) {
      setAuthPromptReason(actionDescription);
      setIsUserModalOpen(true);
      soundManager.playPencilScratch();
      return false;
    }
    return true;
  };

  // Login success handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('digital_planner_user', JSON.stringify(user));
    } catch {}
    soundManager.playPageTurn();
    setToastMessage(`Welcome back, ${user.name}! Connected to your personal database.`);
    loadUserData(user.id);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('digital_planner_user');
    } catch {}
    setCurrentUser(null);
    const demoData = getInitialPlannerData();
    setTodos(demoData.todos);
    setEvents(demoData.events);
    soundManager.playPageTurn();
    setToastMessage('Signed out. Switched to demo preview mode.');
  };

  // Toggle Todo completion status
  const handleToggleTodo = async (id: string) => {
    if (!requireAuth('Sign in or register to check off and save tasks.')) {
      return;
    }

    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    const nextCompletedAt = nextCompleted
      ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : undefined;

    // Optimistic local update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted, completedAt: nextCompletedAt } : t))
    );

    // Backend sync
    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/todos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: nextCompleted, completedAt: nextCompletedAt })
        });
      } catch (err) {
        console.error('Failed to sync todo status:', err);
      }
    }
  };

  // Add new Todo item
  const handleAddTodo = async (newTodoData: Omit<TodoItem, 'id' | 'userId'>) => {
    if (!requireAuth('Sign in or register to create and persist your to-do items.')) {
      return;
    }

    const tempId = `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTodo: TodoItem = {
      ...newTodoData,
      id: tempId,
      userId: currentUser!.id
    };

    // Optimistic local update
    setTodos((prev) => [...prev, newTodo]);
    setToastMessage(`Task added to ${newTodo.date === dateStr ? "today's" : 'selected'} planner.`);

    // Backend sync
    if (currentUser) {
      try {
        const res = await fetch(`/api/users/${currentUser.id}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTodoData)
        });
        if (res.ok) {
          const saved = await res.json();
          setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
        }
      } catch (err) {
        console.error('Failed to persist new todo:', err);
      }
    }
  };

  // Delete Todo item
  const handleDeleteTodo = async (id: string) => {
    if (!requireAuth('Sign in or register to manage your to-do list.')) {
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
    setEvents((prev) => prev.filter((e) => e.todoId !== id));

    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/todos/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to delete todo:', err);
      }
    }
  };

  // Add new Calendar Event
  const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id' | 'userId'>) => {
    if (!requireAuth('Sign in or register to schedule calendar events.')) {
      return;
    }

    const tempId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newEvt: CalendarEvent = {
      ...newEventData,
      id: tempId,
      userId: currentUser!.id
    };

    setEvents((prev) => [...prev, newEvt]);
    soundManager.playCheckTick();
    setToastMessage(`Added event: "${newEvt.title}"`);

    if (currentUser) {
      try {
        const res = await fetch(`/api/users/${currentUser.id}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEventData)
        });
        if (res.ok) {
          const saved = await res.json();
          setEvents((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
        }
      } catch (err) {
        console.error('Failed to persist event:', err);
      }
    }
  };

  // Update Calendar Event
  const handleUpdateEvent = async (eventId: string, eventData: Partial<CalendarEvent>) => {
    if (!requireAuth('Sign in or register to edit scheduled events.')) {
      return;
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...eventData } : e))
    );
    setToastMessage('Event updated.');

    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/events/${eventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });
      } catch (err) {
        console.error('Failed to update event:', err);
      }
    }
  };

  // Delete Calendar Event
  const handleDeleteEvent = async (id: string) => {
    if (!requireAuth('Sign in or register to remove calendar events.')) {
      return;
    }

    const target = events.find((e) => e.id === id);
    if (target?.todoId) {
      setTodos((prev) =>
        prev.map((t) => (t.id === target.todoId ? { ...t, scheduledTime: undefined } : t))
      );
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setToastMessage('Event removed from schedule.');

    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/events/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    }
  };

  // Schedule a todo item directly onto the calendar timeline
  const handleScheduleTodoDirect = (todo: TodoItem) => {
    if (!requireAuth('Sign in or register to schedule tasks on the timeline.')) {
      return;
    }

    const duration = todo.estimatedDuration || 30;
    const startTime = '14:00';
    const endMins = timeToMinutes(startTime) + duration;
    const endTime = minutesToTime(endMins);

    handleAddEvent({
      title: todo.title,
      date: todo.date,
      startTime,
      endTime,
      category: (todo.category as any) || 'work',
      todoId: todo.id,
      notes: todo.notes
    });

    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, scheduledTime: startTime } : t))
    );
  };

  // Drag & drop assignment of a todo into a timeline slot
  const handleDropTodoToTimeline = (todoId: string, timeSlot: string) => {
    if (!requireAuth('Sign in or register to drag and plan tasks.')) {
      return;
    }

    const targetTodo = todos.find((t) => t.id === todoId);
    if (!targetTodo) return;

    const duration = targetTodo.estimatedDuration || 45;
    const startMins = timeToMinutes(timeSlot);
    const endMins = startMins + duration;
    const endTime = minutesToTime(endMins);

    handleAddEvent({
      title: targetTodo.title,
      date: dateStr,
      startTime: timeSlot,
      endTime,
      category: (targetTodo.category as any) || 'work',
      todoId: targetTodo.id,
      notes: targetTodo.notes
    });

    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, scheduledTime: timeSlot } : t))
    );
  };

  // Date Navigation
  const handlePrevDay = () => {
    setFlipDirection('prev');
    soundManager.playPageTurn();
    const nextDate = addDays(currentDate, -1);
    setCurrentDate(nextDate);
    setSelectedMonthTab(MONTH_NAMES[nextDate.getMonth()]);
  };

  const handleNextDay = () => {
    setFlipDirection('next');
    soundManager.playPageTurn();
    const nextDate = addDays(currentDate, 1);
    setCurrentDate(nextDate);
    setSelectedMonthTab(MONTH_NAMES[nextDate.getMonth()]);
  };

  const handleSelectDate = (date: Date) => {
    setFlipDirection(date > currentDate ? 'next' : 'prev');
    soundManager.playPageTurn();
    setCurrentDate(date);
    setSelectedMonthTab(MONTH_NAMES[date.getMonth()]);
  };

  const handlePrevWeek = () => {
    setFlipDirection('prev');
    soundManager.playPageTurn();
    const nextDate = addDays(currentDate, -7);
    setCurrentDate(nextDate);
    setSelectedMonthTab(MONTH_NAMES[nextDate.getMonth()]);
  };

  const handleNextWeek = () => {
    setFlipDirection('next');
    soundManager.playPageTurn();
    const nextDate = addDays(currentDate, 7);
    setCurrentDate(nextDate);
    setSelectedMonthTab(MONTH_NAMES[nextDate.getMonth()]);
  };

  // Handle Month Tab Clicking (Right tabs)
  const handleSelectMonthTab = (monthKey: string) => {
    setSelectedMonthTab(monthKey);
    soundManager.playPageTurn();
    const monthIndex = MONTH_INDEX_MAP[monthKey] ?? currentDate.getMonth();
    const targetYear = currentDate.getFullYear();
    const newDate = new Date(targetYear, monthIndex, 1);
    setCurrentDate(newDate);
  };

  // Toggle Sound effects
  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    soundManager.setEnabled(next);
    if (next) soundManager.playPencilScratch();
  };

  const pageKey = `${viewMode}-${dateStr}`;

  return (
    <JournalDeskFrame
      selectedMonthTab={selectedMonthTab}
      onSelectMonthTab={handleSelectMonthTab}
    >
      {/* Notebook Top Header */}
      <NotebookHeader
        currentDate={currentDate}
        viewMode={viewMode}
        currentUser={currentUser}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onSelectDate={handleSelectDate}
        onToggleView={(mode) => {
          soundManager.playPageTurn();
          setViewMode(mode);
        }}
        onOpenUserModal={() => {
          setAuthPromptReason(null);
          setIsUserModalOpen(true);
        }}
        onToggleSound={toggleSound}
        isSoundEnabled={isSoundEnabled}
      />

      {/* Demo Mode Notification Bar */}
      {!currentUser && (
        <div className="flex items-center justify-between px-6 py-2 bg-[#f4ebe1] border-b border-[#dfd2c0] text-xs text-[#5c4d3e]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#8b5e3c]/15 text-[#8b5e3c] font-serif font-bold text-[11px] tracking-wide">
              DEMO PREVIEW
            </span>
            <span className="hidden sm:inline text-[#6d5e4f]">
              Viewing sample schedule & to-do list for today. Sign in or register to customize your planner.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthPromptReason('Sign in or create an account to start editing your schedule.');
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-1.5 font-serif font-bold text-[#8b5e3c] hover:underline shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Main Journal Page Area with 3D physical page turn animation */}
      <div className="flex-1 flex flex-col min-h-0 relative paper-texture">
        <PageTurnContainer pageKey={pageKey} direction={flipDirection}>
          {viewMode === 'daily' ? (
            <DailyView
              dateStr={dateStr}
              todos={todos}
              events={events}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onScheduleTodo={handleScheduleTodoDirect}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onDropTodoToTimeline={handleDropTodoToTimeline}
            />
          ) : (
            <WeeklyView
              baseDate={currentDate}
              todos={todos}
              events={events}
              onSelectDay={handleSelectDate}
              onToggleTodo={handleToggleTodo}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onSwitchToDaily={() => {
                soundManager.playPageTurn();
                setViewMode('daily');
              }}
            />
          )}
        </PageTurnContainer>
      </div>

      {/* Authentication Modal (Sign In / Register / Profile) */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setAuthPromptReason(null);
        }}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        promptReason={authPromptReason}
      />

      {/* Floating Action Notifications */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </JournalDeskFrame>
  );
}
