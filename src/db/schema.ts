import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique user identifier (e.g., user-fiona or custom UID)
  email: text('email').notNull(),
  password: text('password'),
  name: text('name').notNull(),
  avatar: text('avatar'),
  tagline: text('tagline'),
  role: text('role').default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Events table for calendar schedules & recurring events
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // "09:00"
  endTime: text('end_time').notNull(), // "10:30"
  category: text('category').notNull().default('routine'),
  annotation: text('annotation'),
  todoId: text('todo_id'),
  notes: text('notes'),
  recurrence: text('recurrence'), // JSON string: { frequency, interval, daysOfWeek, until }
  createdAt: timestamp('created_at').defaultNow(),
});

// Todos table for daily tasks & habits
export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  completed: boolean('completed').notNull().default(false),
  completedAt: text('completed_at'),
  estimatedDuration: integer('estimated_duration').notNull().default(30),
  deadline: text('deadline'),
  priority: text('priority').notNull().default('medium'),
  scheduledTime: text('scheduled_time'),
  category: text('category'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  todos: many(todos),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.uid],
  }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.uid],
  }),
}));
