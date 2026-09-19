import { db, isSqlConfigured } from './index.ts';
import { users, events, todos } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export interface UserRow {
  uid: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  tagline?: string;
  role?: string;
}

export interface EventRow {
  id: string;
  userId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category?: string;
  annotation?: string;
  todoId?: string;
  notes?: string;
  recurrence?: string;
}

export interface TodoRow {
  id: string;
  userId: string;
  title: string;
  date: string;
  completed?: boolean;
  completedAt?: string;
  estimatedDuration?: number;
  deadline?: string;
  priority?: string;
  scheduledTime?: string;
  category?: string;
  notes?: string;
}

export async function upsertUser(data: UserRow) {
  if (!isSqlConfigured()) {
    return {
      id: data.uid,
      uid: data.uid,
      email: data.email,
      name: data.name,
      avatar: data.avatar || '',
      tagline: data.tagline || '',
      role: data.role || 'Member',
    };
  }
  try {
    const res = await db.insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        password: data.password || null,
        name: data.name,
        avatar: data.avatar || '',
        tagline: data.tagline || '',
        role: data.role || 'Member',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email,
          ...(data.password ? { password: data.password } : {}),
          name: data.name,
          avatar: data.avatar || '',
          tagline: data.tagline || '',
        },
      })
      .returning();
    const u = res[0];
    return {
      id: u.uid,
      uid: u.uid,
      email: u.email,
      name: u.name,
      avatar: u.avatar || '',
      tagline: u.tagline || '',
      role: u.role || 'Member',
    };
  } catch (error) {
    console.warn('Notice upserting user in PostgreSQL (fallback in effect):', error);
    return {
      id: data.uid,
      uid: data.uid,
      email: data.email,
      name: data.name,
      avatar: data.avatar || '',
      tagline: data.tagline || '',
      role: data.role || 'Member',
    };
  }
}

export async function getUserByEmail(email: string) {
  if (!isSqlConfigured()) return null;
  try {
    const res = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return res[0] || null;
  } catch (error) {
    console.warn('Notice finding user by email in PostgreSQL (fallback in effect):', error);
    return null;
  }
}

export async function getUserByUid(uid: string) {
  if (!isSqlConfigured()) return null;
  try {
    const res = await db.select().from(users).where(eq(users.uid, uid));
    if (!res[0]) return null;
    const u = res[0];
    return {
      id: u.uid,
      uid: u.uid,
      email: u.email,
      name: u.name,
      avatar: u.avatar || '',
      tagline: u.tagline || '',
      role: u.role || 'Member',
    };
  } catch (error) {
    console.warn('Notice finding user by uid in PostgreSQL (fallback in effect):', error);
    return null;
  }
}

export async function getAllUsers() {
  if (!isSqlConfigured()) return [];
  try {
    const list = await db.select().from(users);
    return list.map((u) => ({
      id: u.uid,
      uid: u.uid,
      email: u.email,
      name: u.name,
      avatar: u.avatar || '',
      tagline: u.tagline || '',
      role: u.role || 'Member',
    }));
  } catch (error) {
    console.warn('Notice getting users in PostgreSQL (fallback in effect):', error);
    return [];
  }
}

export async function getUserEvents(userId: string) {
  if (!isSqlConfigured()) return [];
  try {
    return await db.select().from(events).where(eq(events.userId, userId));
  } catch (error) {
    console.warn('Notice getting user events in PostgreSQL (fallback in effect):', error);
    return [];
  }
}

export async function saveUserEvent(data: EventRow) {
  if (!isSqlConfigured()) return data as any;
  try {
    const res = await db.insert(events)
      .values({
        id: data.id,
        userId: data.userId,
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        category: data.category || 'routine',
        annotation: data.annotation || null,
        todoId: data.todoId || null,
        notes: data.notes || null,
        recurrence: data.recurrence || null,
      })
      .onConflictDoUpdate({
        target: events.id,
        set: {
          title: data.title,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category || 'routine',
          annotation: data.annotation || null,
          todoId: data.todoId || null,
          notes: data.notes || null,
          recurrence: data.recurrence || null,
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.warn('Notice saving user event in PostgreSQL (fallback in effect):', error);
    return data as any;
  }
}

export async function updateUserEvent(id: string, userId: string, data: Partial<EventRow>) {
  if (!isSqlConfigured()) return data as any;
  try {
    const setObj: Record<string, any> = {};
    if (data.title !== undefined) setObj.title = data.title;
    if (data.date !== undefined) setObj.date = data.date;
    if (data.startTime !== undefined) setObj.startTime = data.startTime;
    if (data.endTime !== undefined) setObj.endTime = data.endTime;
    if (data.category !== undefined) setObj.category = data.category;
    if (data.annotation !== undefined) setObj.annotation = data.annotation;
    if (data.todoId !== undefined) setObj.todoId = data.todoId;
    if (data.notes !== undefined) setObj.notes = data.notes;
    if (data.recurrence !== undefined) setObj.recurrence = data.recurrence;

    const res = await db.update(events)
      .set(setObj)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return res[0];
  } catch (error) {
    console.warn('Notice updating user event in PostgreSQL (fallback in effect):', error);
    return data as any;
  }
}

export async function deleteUserEvent(id: string, userId: string) {
  if (!isSqlConfigured()) return { success: true };
  try {
    await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
    return { success: true };
  } catch (error) {
    console.warn('Notice deleting user event in PostgreSQL (fallback in effect):', error);
    return { success: true };
  }
}

export async function getUserTodos(userId: string) {
  if (!isSqlConfigured()) return [];
  try {
    return await db.select().from(todos).where(eq(todos.userId, userId));
  } catch (error) {
    console.warn('Notice getting user todos in PostgreSQL (fallback in effect):', error);
    return [];
  }
}

export async function saveUserTodo(data: TodoRow) {
  if (!isSqlConfigured()) return data as any;
  try {
    const res = await db.insert(todos)
      .values({
        id: data.id,
        userId: data.userId,
        title: data.title,
        date: data.date,
        completed: data.completed ?? false,
        completedAt: data.completedAt || null,
        estimatedDuration: data.estimatedDuration ?? 30,
        deadline: data.deadline || null,
        priority: data.priority || 'medium',
        scheduledTime: data.scheduledTime || null,
        category: data.category || null,
        notes: data.notes || null,
      })
      .onConflictDoUpdate({
        target: todos.id,
        set: {
          title: data.title,
          date: data.date,
          completed: data.completed ?? false,
          completedAt: data.completedAt || null,
          estimatedDuration: data.estimatedDuration ?? 30,
          deadline: data.deadline || null,
          priority: data.priority || 'medium',
          scheduledTime: data.scheduledTime || null,
          category: data.category || null,
          notes: data.notes || null,
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.warn('Notice saving user todo in PostgreSQL (fallback in effect):', error);
    return data as any;
  }
}

export async function updateUserTodo(id: string, userId: string, data: Partial<TodoRow>) {
  if (!isSqlConfigured()) return data as any;
  try {
    const setObj: Record<string, any> = {};
    if (data.title !== undefined) setObj.title = data.title;
    if (data.date !== undefined) setObj.date = data.date;
    if (data.completed !== undefined) setObj.completed = data.completed;
    if (data.completedAt !== undefined) setObj.completedAt = data.completedAt;
    if (data.estimatedDuration !== undefined) setObj.estimatedDuration = data.estimatedDuration;
    if (data.deadline !== undefined) setObj.deadline = data.deadline;
    if (data.priority !== undefined) setObj.priority = data.priority;
    if (data.scheduledTime !== undefined) setObj.scheduledTime = data.scheduledTime;
    if (data.category !== undefined) setObj.category = data.category;
    if (data.notes !== undefined) setObj.notes = data.notes;

    const res = await db.update(todos)
      .set(setObj)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return res[0];
  } catch (error) {
    console.warn('Notice updating user todo in PostgreSQL (fallback in effect):', error);
    return data as any;
  }
}

export async function deleteUserTodo(id: string, userId: string) {
  if (!isSqlConfigured()) return { success: true };
  try {
    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
    return { success: true };
  } catch (error) {
    console.warn('Notice deleting user todo in PostgreSQL (fallback in effect):', error);
    return { success: true };
  }
}

export async function resetUserData(userId: string) {
  if (!isSqlConfigured()) return { success: true };
  try {
    await db.delete(events).where(eq(events.userId, userId));
    await db.delete(todos).where(eq(todos.userId, userId));
    return { success: true };
  } catch (error) {
    console.warn('Notice resetting user data in PostgreSQL (fallback in effect):', error);
    return { success: true };
  }
}
