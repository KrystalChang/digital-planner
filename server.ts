import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { getInitialPlannerData } from './src/data/initialData';
import * as dbQueries from './src/db/queries.ts';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper for secure password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_planner_db_salt_2026').digest('hex');
}

// Persistent store setup (for seamless fallback / local sync across all environments)
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'planner-db.json');
const TMP_DB_FILE = path.join('/tmp', 'planner-db.json');

interface DatabaseSchema {
  users: Array<any>;
  todos: Array<any>;
  events: Array<any>;
}

// In-memory cache for ultra-resilient operation even in ephemeral container filesystems
let globalMemoryDb: DatabaseSchema | null = null;

// Generate default initial database if not existing
function getInitialDb(): DatabaseSchema {
  const initialData = getInitialPlannerData();
  const defaultPasswordHash = hashPassword('planner123');

  return {
    users: [
      {
        id: 'user-fiona',
        name: 'Fiona',
        email: 'fiona930607@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        tagline: 'A calmer today, A brighter tomorrow.',
        role: 'Journal Curator',
        password: defaultPasswordHash
      },
      {
        id: 'user-alex',
        name: 'Alex Morgan',
        email: 'alex.m@example.com',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        tagline: 'Deep work & mindful progress.',
        role: 'Member',
        password: defaultPasswordHash
      },
      {
        id: 'user-elena',
        name: 'Elena Chen',
        email: 'elena.chen@example.com',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        tagline: 'Creative studio curator.',
        role: 'Member',
        password: defaultPasswordHash
      }
    ],
    todos: initialData.todos.map(t => ({
      id: t.id,
      userId: t.userId || 'user-fiona',
      title: t.title,
      date: t.date,
      completed: t.completed,
      completedAt: t.completedAt,
      estimatedDuration: t.estimatedDuration,
      deadline: t.deadline,
      priority: t.priority,
      scheduledTime: t.scheduledTime,
      notes: t.notes
    })),
    events: initialData.events.map(e => ({
      id: e.id,
      userId: e.userId || 'user-fiona',
      title: e.title,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      category: e.category,
      annotation: e.annotation,
      todoId: e.todoId,
      notes: e.notes
    }))
  };
}

function loadDb(): DatabaseSchema {
  if (globalMemoryDb) {
    return globalMemoryDb;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
    }
    
    let content: string | null = null;
    if (fs.existsSync(DB_FILE)) {
      content = fs.readFileSync(DB_FILE, 'utf-8');
    } else if (fs.existsSync(TMP_DB_FILE)) {
      content = fs.readFileSync(TMP_DB_FILE, 'utf-8');
    }

    if (content) {
      const db: DatabaseSchema = JSON.parse(content);
      if (Array.isArray(db.users) && db.users.length > 0) {
        // Ensure all users have passwords
        for (const u of db.users) {
          if (!u.password) {
            u.password = hashPassword('planner123');
          }
        }
        globalMemoryDb = db;
        return db;
      }
    }
  } catch (err) {
    console.warn('Notice reading db file, regenerating fresh state:', err);
  }

  const init = getInitialDb();
  saveDb(init);
  return init;
}

function saveDb(db: DatabaseSchema) {
  globalMemoryDb = db;
  let saved = false;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    saved = true;
  } catch (err) {
    // Disk write error in restricted container environment
  }

  if (!saved) {
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch {}
  }
}

// Seed initial planner data into PostgreSQL Cloud SQL
async function initDatabaseData() {
  try {
    const existingUsers = await dbQueries.getAllUsers();
    if (!existingUsers || existingUsers.length === 0) {
      console.log('Seeding initial planner records into PostgreSQL database...');
      const init = getInitialDb();
      for (const u of init.users) {
        await dbQueries.upsertUser({
          uid: u.id,
          email: u.email,
          password: u.password,
          name: u.name,
          avatar: u.avatar,
          tagline: u.tagline,
          role: u.role
        });
      }
      for (const t of init.todos) {
        await dbQueries.saveUserTodo({
          id: t.id,
          userId: t.userId,
          title: t.title,
          date: t.date,
          completed: t.completed,
          completedAt: t.completedAt,
          estimatedDuration: t.estimatedDuration,
          deadline: t.deadline,
          priority: t.priority,
          scheduledTime: t.scheduledTime,
          notes: t.notes
        });
      }
      for (const e of init.events) {
        await dbQueries.saveUserEvent({
          id: e.id,
          userId: e.userId,
          title: e.title,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          category: e.category,
          annotation: e.annotation,
          todoId: e.todoId,
          notes: e.notes
        });
      }
      console.log('PostgreSQL database seeded successfully.');
    } else {
      console.log(`Connected to PostgreSQL Cloud SQL. Found ${existingUsers.length} registered users.`);
    }
  } catch (err) {
    console.warn('PostgreSQL auto-seed notice (app continues normally):', err);
  }
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'PostgreSQL (Cloud SQL)',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/database/status', async (req, res) => {
  try {
    const users = await dbQueries.getAllUsers();
    res.json({
      connected: true,
      engine: 'PostgreSQL (Cloud SQL)',
      userCount: users.length,
      host: process.env.SQL_HOST || 'Cloud SQL',
      db: process.env.SQL_DB_NAME || 'postgres'
    });
  } catch (err: any) {
    res.json({
      connected: false,
      engine: 'PostgreSQL (Cloud SQL)',
      error: err.message,
      fallback: 'Local active cache'
    });
  }
});

// Database Authentication Endpoints (Register, Login, Logout, Session)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, avatar, tagline } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!password || password.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const displayName = name.trim();

  try {
    // 1. Check local DB first for fast, reliable conflict detection
    const db = loadDb();
    const localExisting = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (localExisting) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // 2. Also safely check PostgreSQL if reachable
    try {
      const pgExisting = await dbQueries.getUserByEmail(cleanEmail);
      if (pgExisting) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
      }
    } catch (dbErr) {
      // Cloud SQL may be unavailable in some deployment tiers; continue with persistent local store
    }

    const uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const hashedPassword = hashPassword(password);
    const userAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const userTagline = tagline || 'A calmer today, a brighter tomorrow.';

    // 3. Save to resilient persistent store first (always succeeds)
    const newUserRecord = {
      id: uid,
      uid,
      name: displayName,
      email: cleanEmail,
      password: hashedPassword,
      avatar: userAvatar,
      tagline: userTagline,
      role: 'Member'
    };
    db.users.push(newUserRecord);
    saveDb(db);

    // 4. Safely sync to PostgreSQL in the background if connected
    try {
      await dbQueries.upsertUser({
        uid,
        email: cleanEmail,
        password: hashedPassword,
        name: displayName,
        avatar: userAvatar,
        tagline: userTagline,
        role: 'Member'
      });
    } catch (pgSyncErr) {
      console.warn('PostgreSQL sync notice on register (local record persisted):', pgSyncErr);
    }

    const safeUser = {
      id: uid,
      uid,
      name: displayName,
      email: cleanEmail,
      avatar: userAvatar,
      tagline: userTagline,
      role: 'Member'
    };

    return res.json({
      success: true,
      user: safeUser,
      message: 'Account registered successfully!'
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const inputHash = hashPassword(password);

  try {
    // 1. Look up in PostgreSQL if reachable
    let pgUser: any = null;
    try {
      pgUser = await dbQueries.getUserByEmail(cleanEmail);
    } catch (err) {
      // Cloud SQL unavailable or disconnected, safely fall back
    }

    // 2. Look up in local resilient store
    const db = loadDb();
    const localUser = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    const userCandidate = localUser || pgUser;
    if (!userCandidate) {
      return res.status(404).json({ error: 'No registered account found with this email. Please register first.' });
    }

    // 3. Verify password
    const storedPassword = userCandidate.password || (localUser && localUser.password) || (pgUser && pgUser.password);

    if (storedPassword) {
      if (storedPassword !== inputHash) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    } else {
      // Default sample user check (e.g. Fiona)
      if (cleanEmail === 'fiona930607@gmail.com' && password !== 'planner123') {
        return res.status(401).json({ error: 'Incorrect password. Default sample password is "planner123".' });
      }
      // Store the hash for next time
      if (localUser) {
        localUser.password = inputHash;
        saveDb(db);
      }
      try {
        await dbQueries.upsertUser({
          uid: userCandidate.uid || userCandidate.id,
          email: userCandidate.email,
          password: inputHash,
          name: userCandidate.name,
          avatar: userCandidate.avatar,
          tagline: userCandidate.tagline,
          role: userCandidate.role
        });
      } catch {}
    }

    const safeUser = {
      id: userCandidate.uid || userCandidate.id,
      name: userCandidate.name,
      email: userCandidate.email,
      avatar: userCandidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      tagline: userCandidate.tagline || '',
      role: userCandidate.role || 'Member'
    };

    return res.json({
      success: true,
      user: safeUser,
      message: 'Logged in successfully'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login service encountered an error. Please try again.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', async (req, res) => {
  const userId = (req.headers['x-user-id'] || req.query.userId) as string;
  if (!userId) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const user = await dbQueries.getUserByUid(userId);
    if (user) {
      return res.json({ authenticated: true, user });
    }
  } catch (err) {
    // fallback
  }

  const db = loadDb();
  const localUser = db.users.find(u => u.id === userId || u.uid === userId);
  if (localUser) {
    return res.json({
      authenticated: true,
      user: {
        id: localUser.id || localUser.uid,
        name: localUser.name,
        email: localUser.email,
        avatar: localUser.avatar,
        tagline: localUser.tagline,
        role: localUser.role
      }
    });
  }

  return res.status(404).json({ authenticated: false });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const pgUsers = await dbQueries.getAllUsers();
    if (pgUsers && pgUsers.length > 0) {
      return res.json(pgUsers.map(u => ({
        id: u.uid || u.id,
        uid: u.uid || u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        tagline: u.tagline,
        role: u.role
      })));
    }
  } catch (err) {
    console.warn('PostgreSQL fetch users notice, fallback to local cache:', err);
  }
  const db = loadDb();
  res.json(db.users.map(u => ({
    id: u.id || u.uid,
    uid: u.id || u.uid,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    tagline: u.tagline,
    role: u.role
  })));
});

// Create new user
app.post('/api/users', async (req, res) => {
  const { name, email, avatar, tagline } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const userId = `user-${Date.now()}`;
  const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
  const userAvatar = avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
  const userTagline = tagline || 'A calmer today, A brighter tomorrow.';

  try {
    const saved = await dbQueries.upsertUser({
      uid: userId,
      name,
      email: userEmail,
      avatar: userAvatar,
      tagline: userTagline,
      role: 'Member'
    });
    const db = loadDb();
    db.users.push(saved);
    saveDb(db);
    return res.json(saved);
  } catch (err) {
    console.warn('PostgreSQL upsertUser notice, fallback to local:', err);
    const db = loadDb();
    const newUser = {
      id: userId,
      name,
      email: userEmail,
      avatar: userAvatar,
      tagline: userTagline
    };
    db.users.push(newUser);
    saveDb(db);
    res.json(newUser);
  }
});

// Get user data (todos and events)
app.get('/api/users/:userId/data', async (req, res) => {
  const { userId } = req.params;
  const db = loadDb();
  let user: any = db.users.find(u => u.id === userId || u.uid === userId);

  let pgTodos: any[] = [];
  let pgEvents: any[] = [];

  try {
    if (!user) {
      user = await dbQueries.getUserByUid(userId);
    }
    pgTodos = await dbQueries.getUserTodos(userId);
    pgEvents = await dbQueries.getUserEvents(userId);
  } catch (err) {
    // Cloud SQL unavailable or disconnected, use local data seamlessly
  }

  if (!user) {
    // Graceful user object creation if id was passed from client storage
    user = {
      id: userId,
      uid: userId,
      name: 'Journal User',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Member'
    };
  }

  const safeUser = {
    id: user.id || user.uid,
    uid: user.id || user.uid,
    name: user.name,
    email: user.email,
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tagline: user.tagline || '',
    role: user.role || 'Member'
  };

  const formattedEvents = pgEvents.map(e => ({
    id: e.id,
    userId: e.userId,
    title: e.title,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    category: e.category,
    annotation: e.annotation || undefined,
    todoId: e.todoId || undefined,
    notes: e.notes || undefined,
    recurrence: e.recurrence ? (typeof e.recurrence === 'string' ? JSON.parse(e.recurrence) : e.recurrence) : undefined
  }));

  if (pgTodos.length > 0 || formattedEvents.length > 0) {
    return res.json({
      user: safeUser,
      todos: pgTodos,
      events: formattedEvents
    });
  }

  // If PostgreSQL had no records or was unavailable, read local DB
  const localTodos = db.todos.filter(t => t.userId === userId);
  const localEvents = db.events.filter(e => e.userId === userId);

  return res.json({
    user: safeUser,
    todos: localTodos,
    events: localEvents
  });
});

// Create todo for user
app.post('/api/users/:userId/todos', async (req, res) => {
  const { userId } = req.params;
  const newTodo = {
    ...req.body,
    id: req.body.id || `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId
  };
  try {
    const saved = await dbQueries.saveUserTodo(newTodo);
    const db = loadDb();
    db.todos.push(saved);
    saveDb(db);
    return res.json(saved);
  } catch (err) {
    console.warn('PostgreSQL saveUserTodo notice, using local cache:', err);
    const db = loadDb();
    db.todos.push(newTodo);
    saveDb(db);
    res.json(newTodo);
  }
});

// Update todo
app.patch('/api/users/:userId/todos/:todoId', async (req, res) => {
  const { userId, todoId } = req.params;
  try {
    const updated = await dbQueries.updateUserTodo(todoId, userId, req.body);
    const db = loadDb();
    const idx = db.todos.findIndex(t => t.id === todoId && t.userId === userId);
    if (idx !== -1) {
      db.todos[idx] = { ...db.todos[idx], ...req.body };
      saveDb(db);
    }
    return res.json(updated);
  } catch (err) {
    console.warn('PostgreSQL updateUserTodo notice, using local cache:', err);
    const db = loadDb();
    const idx = db.todos.findIndex(t => t.id === todoId && t.userId === userId);
    if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
    db.todos[idx] = { ...db.todos[idx], ...req.body };
    saveDb(db);
    res.json(db.todos[idx]);
  }
});

// Delete todo
app.delete('/api/users/:userId/todos/:todoId', async (req, res) => {
  const { userId, todoId } = req.params;
  try {
    await dbQueries.deleteUserTodo(todoId, userId);
  } catch (err) {
    console.warn('PostgreSQL deleteUserTodo notice:', err);
  }
  const db = loadDb();
  db.todos = db.todos.filter(t => !(t.id === todoId && t.userId === userId));
  db.events = db.events.filter(e => !(e.todoId === todoId && e.userId === userId));
  saveDb(db);
  res.json({ success: true });
});

// Create event for user
app.post('/api/users/:userId/events', async (req, res) => {
  const { userId } = req.params;
  const recurrenceStr = req.body.recurrence 
    ? (typeof req.body.recurrence === 'object' ? JSON.stringify(req.body.recurrence) : req.body.recurrence)
    : null;
  const newEvent = {
    ...req.body,
    id: req.body.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId
  };
  try {
    const saved = await dbQueries.saveUserEvent({
      ...newEvent,
      recurrence: recurrenceStr
    });
    const db = loadDb();
    db.events.push({ ...newEvent, recurrence: req.body.recurrence });
    saveDb(db);
    return res.json({ ...saved, recurrence: req.body.recurrence });
  } catch (err) {
    console.warn('PostgreSQL saveUserEvent notice, using local cache:', err);
    const db = loadDb();
    db.events.push(newEvent);
    saveDb(db);
    res.json(newEvent);
  }
});

// Update event
app.patch('/api/users/:userId/events/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  const recurrenceStr = req.body.recurrence !== undefined
    ? (typeof req.body.recurrence === 'object' ? JSON.stringify(req.body.recurrence) : req.body.recurrence)
    : undefined;
  try {
    const updated = await dbQueries.updateUserEvent(eventId, userId, {
      ...req.body,
      recurrence: recurrenceStr
    });
    const db = loadDb();
    const idx = db.events.findIndex(e => e.id === eventId && e.userId === userId);
    if (idx !== -1) {
      db.events[idx] = { ...db.events[idx], ...req.body };
      saveDb(db);
    }
    return res.json({ ...updated, recurrence: req.body.recurrence });
  } catch (err) {
    console.warn('PostgreSQL updateUserEvent notice, using local cache:', err);
    const db = loadDb();
    const idx = db.events.findIndex(e => e.id === eventId && e.userId === userId);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    db.events[idx] = { ...db.events[idx], ...req.body };
    saveDb(db);
    res.json(db.events[idx]);
  }
});

// Delete event
app.delete('/api/users/:userId/events/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  try {
    await dbQueries.deleteUserEvent(eventId, userId);
  } catch (err) {
    console.warn('PostgreSQL deleteUserEvent notice:', err);
  }
  const db = loadDb();
  db.events = db.events.filter(e => !(e.id === eventId && e.userId === userId));
  saveDb(db);
  res.json({ success: true });
});

// Reset user's data to initial state
app.post('/api/users/:userId/reset', async (req, res) => {
  const { userId } = req.params;
  const init = getInitialDb();
  const userTodos = init.todos.map(t => ({ ...t, userId }));
  const userEvents = init.events.map(e => ({ ...e, userId }));

  try {
    await dbQueries.resetUserData(userId);
    for (const t of userTodos) {
      await dbQueries.saveUserTodo(t).catch(() => {});
    }
    for (const e of userEvents) {
      await dbQueries.saveUserEvent({
        ...e,
        recurrence: e.recurrence ? JSON.stringify(e.recurrence) : undefined
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('PostgreSQL resetUserData notice:', err);
  }

  const db = loadDb();
  db.todos = db.todos.filter(t => t.userId !== userId);
  db.events = db.events.filter(e => e.userId !== userId);
  db.todos.push(...userTodos);
  db.events.push(...userEvents);
  saveDb(db);

  res.json({ success: true, todos: userTodos, events: userEvents });
});

// Vite & Static file serving
async function start() {
  await initDatabaseData();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
