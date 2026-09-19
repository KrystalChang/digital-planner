import { CalendarEvent, TodoItem } from '../types';
import { formatDateKey, getWeekDays } from '../utils/dateUtils';

export function getInitialPlannerData(): { todos: TodoItem[]; events: CalendarEvent[] } {
  const today = new Date();
  const weekDays = getWeekDays(today);
  const todayKey = formatDateKey(today);

  // Default current reference day (2025-09-17)
  const defaultRefKey = '2025-09-17';

  const todos: TodoItem[] = [
    // -------------------------------------------------------------
    // September 2025 (Fiona's Primary Reference Day)
    // -------------------------------------------------------------
    {
      id: 'todo-sep-1',
      userId: 'user-fiona',
      title: 'Reply to email',
      date: defaultRefKey,
      completed: true,
      completedAt: '08:30',
      estimatedDuration: 15,
      priority: 'low',
      category: 'routine',
      notes: 'Check professor & client inbox'
    },
    {
      id: 'todo-sep-2',
      userId: 'user-fiona',
      title: 'LeetCode (2 problems)',
      date: defaultRefKey,
      completed: true,
      completedAt: '10:15',
      estimatedDuration: 60,
      priority: 'medium',
      category: 'focus',
      notes: 'Dynamic programming & memoization'
    },
    {
      id: 'todo-sep-3',
      userId: 'user-fiona',
      title: 'Finish AI report',
      date: defaultRefKey,
      completed: false,
      estimatedDuration: 120,
      deadline: '16:00',
      priority: 'high',
      category: 'work',
      notes: 'Benchmark transformer fine-tuning loss'
    },
    {
      id: 'todo-sep-4',
      userId: 'user-fiona',
      title: 'Read research paper',
      date: defaultRefKey,
      completed: true,
      completedAt: '14:45',
      estimatedDuration: 30,
      priority: 'medium',
      category: 'research'
    },
    {
      id: 'todo-sep-5',
      userId: 'user-fiona',
      title: 'Plan next week',
      date: defaultRefKey,
      completed: false,
      estimatedDuration: 30,
      priority: 'low',
      category: 'routine'
    },
    {
      id: 'todo-sep-6',
      userId: 'user-fiona',
      title: 'Buy birthday gift',
      date: defaultRefKey,
      completed: false,
      estimatedDuration: 30,
      priority: 'low',
      category: 'personal'
    },
    {
      id: 'todo-sep-7',
      userId: 'user-fiona',
      title: 'Call mom',
      date: defaultRefKey,
      completed: true,
      completedAt: '18:15',
      estimatedDuration: 15,
      priority: 'low',
      category: 'personal'
    },

    // -------------------------------------------------------------
    // January 2025 (JAN) - New Year Intentions & Kickoff
    // -------------------------------------------------------------
    {
      id: 'todo-jan-1',
      userId: 'user-fiona',
      title: 'Write 2025 annual vision & mindful intentions',
      date: '2025-01-15',
      completed: true,
      completedAt: '09:00',
      estimatedDuration: 45,
      priority: 'high',
      category: 'routine',
      notes: 'Focus on health, creative writing, and research'
    },
    {
      id: 'todo-jan-2',
      userId: 'user-fiona',
      title: 'Studio desk declutter & stationery inventory',
      date: '2025-01-15',
      completed: true,
      completedAt: '11:30',
      estimatedDuration: 30,
      priority: 'low',
      category: 'personal'
    },
    {
      id: 'todo-jan-3',
      userId: 'user-fiona',
      title: 'Set up Q1 project milestones & reading schedule',
      date: '2025-01-15',
      completed: true,
      completedAt: '15:20',
      estimatedDuration: 60,
      priority: 'medium',
      category: 'work'
    },

    // -------------------------------------------------------------
    // February 2025 (FEB) - Deep Learning & Foundation
    // -------------------------------------------------------------
    {
      id: 'todo-feb-1',
      userId: 'user-fiona',
      title: 'Complete Neural Networks chapter 4 problem set',
      date: '2025-02-14',
      completed: true,
      completedAt: '10:00',
      estimatedDuration: 90,
      priority: 'high',
      category: 'research'
    },
    {
      id: 'todo-feb-2',
      userId: 'user-fiona',
      title: 'Reserve botanical bistro table for Valentine dinner',
      date: '2025-02-14',
      completed: true,
      completedAt: '12:15',
      estimatedDuration: 15,
      priority: 'medium',
      category: 'personal'
    },
    {
      id: 'todo-feb-3',
      userId: 'user-fiona',
      title: 'Update GitHub portfolio with latest design system',
      date: '2025-02-14',
      completed: true,
      completedAt: '16:40',
      estimatedDuration: 45,
      priority: 'low',
      category: 'work'
    },

    // -------------------------------------------------------------
    // March 2025 (MAR) - Spring Sprint & Health
    // -------------------------------------------------------------
    {
      id: 'todo-mar-1',
      userId: 'user-fiona',
      title: 'Spring 10K outdoor run around the lake',
      date: '2025-03-18',
      completed: true,
      completedAt: '07:45',
      estimatedDuration: 60,
      priority: 'medium',
      category: 'gym'
    },
    {
      id: 'todo-mar-2',
      userId: 'user-fiona',
      title: 'Submit workshop paper draft to peer review',
      date: '2025-03-18',
      completed: true,
      completedAt: '14:00',
      estimatedDuration: 90,
      priority: 'high',
      category: 'research'
    },
    {
      id: 'todo-mar-3',
      userId: 'user-fiona',
      title: 'Quarterly financial savings & budget audit',
      date: '2025-03-18',
      completed: true,
      completedAt: '17:30',
      estimatedDuration: 30,
      priority: 'low',
      category: 'routine'
    },

    // -------------------------------------------------------------
    // April 2025 (APR) - Design & Botanical Exploration
    // -------------------------------------------------------------
    {
      id: 'todo-apr-1',
      userId: 'user-fiona',
      title: 'Botanical garden sketch outing & watercolor prep',
      date: '2025-04-16',
      completed: true,
      completedAt: '10:30',
      estimatedDuration: 60,
      priority: 'medium',
      category: 'personal'
    },
    {
      id: 'todo-apr-2',
      userId: 'user-fiona',
      title: 'Finalize mobile responsive typography specs',
      date: '2025-04-16',
      completed: true,
      completedAt: '15:10',
      estimatedDuration: 45,
      priority: 'high',
      category: 'work'
    },

    // -------------------------------------------------------------
    // May 2025 (MAY) - Mid-Year Momentum
    // -------------------------------------------------------------
    {
      id: 'todo-may-1',
      userId: 'user-fiona',
      title: 'Prepare slides for HCI Conference lighting talk',
      date: '2025-05-20',
      completed: true,
      completedAt: '11:00',
      estimatedDuration: 60,
      priority: 'high',
      category: 'work'
    },
    {
      id: 'todo-may-2',
      userId: 'user-fiona',
      title: 'Repot balcony lavender and rosemary herbs',
      date: '2025-05-20',
      completed: true,
      completedAt: '16:20',
      estimatedDuration: 30,
      priority: 'low',
      category: 'personal'
    },

    // -------------------------------------------------------------
    // June 2025 (JUN) - Summer Project Kickoff
    // -------------------------------------------------------------
    {
      id: 'todo-jun-1',
      userId: 'user-fiona',
      title: 'Plan summer trip to Hokkaido & booking confirmations',
      date: '2025-06-18',
      completed: true,
      completedAt: '09:30',
      estimatedDuration: 45,
      priority: 'medium',
      category: 'personal'
    },
    {
      id: 'todo-jun-2',
      userId: 'user-fiona',
      title: 'Mid-year performance self-review & retrospective',
      date: '2025-06-18',
      completed: true,
      completedAt: '14:15',
      estimatedDuration: 60,
      priority: 'high',
      category: 'work'
    },

    // -------------------------------------------------------------
    // July 2025 (JUL) - Summer Deep Work
    // -------------------------------------------------------------
    {
      id: 'todo-jul-1',
      userId: 'user-fiona',
      title: 'Read: "The Design of Everyday Things" re-read',
      date: '2025-07-15',
      completed: true,
      completedAt: '10:00',
      estimatedDuration: 45,
      priority: 'low',
      category: 'research'
    },
    {
      id: 'todo-jul-2',
      userId: 'user-fiona',
      title: 'Refactor REST API controllers & add test suite',
      date: '2025-07-15',
      completed: true,
      completedAt: '15:45',
      estimatedDuration: 90,
      priority: 'high',
      category: 'work'
    },

    // -------------------------------------------------------------
    // August 2025 (AUG) - Late Summer Recharge
    // -------------------------------------------------------------
    {
      id: 'todo-aug-1',
      userId: 'user-fiona',
      title: 'Curate fall semester reading list & syllabus prep',
      date: '2025-08-20',
      completed: true,
      completedAt: '10:45',
      estimatedDuration: 45,
      priority: 'medium',
      category: 'routine'
    },
    {
      id: 'todo-aug-2',
      userId: 'user-fiona',
      title: 'Order vintage brass fountain pen & chestnut ink',
      date: '2025-08-20',
      completed: true,
      completedAt: '13:30',
      estimatedDuration: 15,
      priority: 'low',
      category: 'personal'
    },

    // -------------------------------------------------------------
    // October 2025 (OCT) - Autumn Focus
    // -------------------------------------------------------------
    {
      id: 'todo-oct-1',
      userId: 'user-fiona',
      title: 'Autumn hiking trail meetup with study group',
      date: '2025-10-15',
      completed: false,
      estimatedDuration: 90,
      priority: 'medium',
      category: 'social'
    },
    {
      id: 'todo-oct-2',
      userId: 'user-fiona',
      title: 'Draft Q4 research grant progress statement',
      date: '2025-10-15',
      completed: false,
      estimatedDuration: 60,
      priority: 'high',
      category: 'work'
    },

    // -------------------------------------------------------------
    // November 2025 (NOV) - Harvest & Delivery
    // -------------------------------------------------------------
    {
      id: 'todo-nov-1',
      userId: 'user-fiona',
      title: 'Finalize machine learning model evaluation metrics',
      date: '2025-11-19',
      completed: false,
      estimatedDuration: 90,
      priority: 'high',
      category: 'research'
    },
    {
      id: 'todo-nov-2',
      userId: 'user-fiona',
      title: 'Bake cinnamon pecan rolls for friends',
      date: '2025-11-19',
      completed: false,
      estimatedDuration: 45,
      priority: 'low',
      category: 'personal'
    },

    // -------------------------------------------------------------
    // December 2025 (DEC) - Year-End Reflection
    // -------------------------------------------------------------
    {
      id: 'todo-dec-1',
      userId: 'user-fiona',
      title: '2025 Year-in-Review: Lessons, gratitude & highlights',
      date: '2025-12-17',
      completed: false,
      estimatedDuration: 60,
      priority: 'high',
      category: 'routine'
    },
    {
      id: 'todo-dec-2',
      userId: 'user-fiona',
      title: 'Handwrite holiday greeting cards & dispatch',
      date: '2025-12-17',
      completed: false,
      estimatedDuration: 45,
      priority: 'medium',
      category: 'personal'
    }
  ];

  // Also include current day fallback items if today is not 2025-09-17
  if (todayKey !== defaultRefKey) {
    todos.push(
      {
        id: `todo-dyn-1`,
        userId: 'user-fiona',
        title: 'Morning reflection & daily prioritization',
        date: todayKey,
        completed: true,
        completedAt: '08:45',
        estimatedDuration: 20,
        priority: 'low',
        category: 'routine'
      },
      {
        id: `todo-dyn-2`,
        userId: 'user-fiona',
        title: 'Review schedule & focus sprint',
        date: todayKey,
        completed: false,
        estimatedDuration: 60,
        priority: 'high',
        category: 'work'
      }
    );
  }

  // -------------------------------------------------------------
  // Calendar Events Across the Year (Matching timeline)
  // -------------------------------------------------------------
  const events: CalendarEvent[] = [
    // Today's dynamic schedule if not defaultRefKey
    ...(todayKey !== defaultRefKey
      ? [
          {
            id: `evt-today-1`,
            userId: 'user-fiona',
            title: 'Morning Routine & Coffee',
            date: todayKey,
            startTime: '08:00',
            endTime: '09:00',
            category: 'routine' as const,
            annotation: 'Fresh start!',
            notes: 'Espresso & day planning'
          },
          {
            id: `evt-today-2`,
            userId: 'user-fiona',
            title: 'Deep Work Sprint',
            date: todayKey,
            startTime: '10:00',
            endTime: '11:30',
            category: 'work' as const,
            notes: 'Focus on high priority deliverables'
          },
          {
            id: `evt-today-3`,
            userId: 'user-fiona',
            title: 'Mindful Lunch Walk',
            date: todayKey,
            startTime: '12:30',
            endTime: '13:30',
            category: 'freetime' as const,
            annotation: 'Fresh air & sun'
          },
          {
            id: `evt-today-4`,
            userId: 'user-fiona',
            title: 'Research & Creative Planning',
            date: todayKey,
            startTime: '14:30',
            endTime: '16:00',
            category: 'research' as const
          },
          {
            id: `evt-today-5`,
            userId: 'user-fiona',
            title: 'Evening Workout & Stretch',
            date: todayKey,
            startTime: '17:30',
            endTime: '18:30',
            category: 'gym' as const,
            annotation: 'Hydrate well!'
          }
        ]
      : []),
    // September 17, 2025 (Matching image.png timeline exactly)
    {
      id: 'evt-f-1',
      userId: 'user-fiona',
      title: 'Morning Routine',
      date: defaultRefKey,
      startTime: '07:00',
      endTime: '08:00',
      category: 'routine',
      annotation: 'Good morning!',
      notes: 'Espresso & reflection'
    },
    {
      id: 'evt-f-2',
      userId: 'user-fiona',
      title: 'Algorithms (Class)',
      date: defaultRefKey,
      startTime: '09:00',
      endTime: '10:30',
      category: 'class',
      notes: 'Dynamic programming & trees'
    },
    {
      id: 'evt-f-3',
      userId: 'user-fiona',
      title: 'Team Meeting',
      date: defaultRefKey,
      startTime: '11:00',
      endTime: '12:00',
      category: 'meeting',
      notes: 'Sprint planning'
    },
    {
      id: 'evt-f-4',
      userId: 'user-fiona',
      title: 'Free time',
      date: defaultRefKey,
      startTime: '13:00',
      endTime: '14:00',
      category: 'freetime',
      annotation: 'Maybe lunch here?',
      notes: 'Unwind & stroll'
    },
    {
      id: 'evt-f-5',
      userId: 'user-fiona',
      title: 'Research',
      date: defaultRefKey,
      startTime: '14:00',
      endTime: '16:00',
      category: 'research',
      notes: 'Literature review on generative agents'
    },
    {
      id: 'evt-f-6',
      userId: 'user-fiona',
      title: 'Gym',
      date: defaultRefKey,
      startTime: '17:00',
      endTime: '18:00',
      category: 'gym',
      notes: 'Strength training & stretch'
    },
    {
      id: 'evt-f-7',
      userId: 'user-fiona',
      title: 'Dinner with Friends',
      date: defaultRefKey,
      startTime: '19:00',
      endTime: '21:00',
      category: 'social',
      annotation: 'Good food, Good mood!',
      notes: 'Trattoria downtown'
    },

    // Past Months Events
    {
      id: 'evt-jan-1',
      userId: 'user-fiona',
      title: 'New Year Strategic Vision',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '11:00',
      category: 'focus',
      annotation: 'Fresh start!',
      notes: 'Mapping 2025 priorities'
    },
    {
      id: 'evt-jan-2',
      userId: 'user-fiona',
      title: 'Winter Afternoon Walk',
      date: '2025-01-15',
      startTime: '15:00',
      endTime: '16:00',
      category: 'personal'
    },

    {
      id: 'evt-feb-1',
      userId: 'user-fiona',
      title: 'Deep Learning Workshop',
      date: '2025-02-14',
      startTime: '10:00',
      endTime: '12:00',
      category: 'class'
    },
    {
      id: 'evt-feb-2',
      userId: 'user-fiona',
      title: 'Valentine Bistro Dinner',
      date: '2025-02-14',
      startTime: '18:30',
      endTime: '20:30',
      category: 'social',
      annotation: 'Romantic evening!'
    },

    {
      id: 'evt-mar-1',
      userId: 'user-fiona',
      title: 'Spring Research Symposium',
      date: '2025-03-18',
      startTime: '13:00',
      endTime: '15:30',
      category: 'research'
    },
    {
      id: 'evt-mar-2',
      userId: 'user-fiona',
      title: 'Routine Health Checkup',
      date: '2025-03-18',
      startTime: '16:30',
      endTime: '17:30',
      category: 'personal'
    },

    {
      id: 'evt-apr-1',
      userId: 'user-fiona',
      title: 'Design Sprint: UX & Typography',
      date: '2025-04-16',
      startTime: '10:00',
      endTime: '12:00',
      category: 'work'
    },
    {
      id: 'evt-apr-2',
      userId: 'user-fiona',
      title: 'Botanical Garden Drawing',
      date: '2025-04-16',
      startTime: '14:00',
      endTime: '16:00',
      category: 'personal',
      annotation: 'Spring blossoms'
    },

    {
      id: 'evt-may-1',
      userId: 'user-fiona',
      title: 'HCI Paper Presentation',
      date: '2025-05-20',
      startTime: '11:00',
      endTime: '12:30',
      category: 'research'
    },
    {
      id: 'evt-may-2',
      userId: 'user-fiona',
      title: 'Evening Yoga & Pilates',
      date: '2025-05-20',
      startTime: '18:00',
      endTime: '19:15',
      category: 'gym'
    },

    {
      id: 'evt-jun-1',
      userId: 'user-fiona',
      title: 'Summer Solstice Team Lunch',
      date: '2025-06-18',
      startTime: '12:00',
      endTime: '14:00',
      category: 'social'
    },
    {
      id: 'evt-jun-2',
      userId: 'user-fiona',
      title: 'Travel Planning Session',
      date: '2025-06-18',
      startTime: '16:00',
      endTime: '17:30',
      category: 'personal'
    },

    {
      id: 'evt-jul-1',
      userId: 'user-fiona',
      title: 'Product Architecture Review',
      date: '2025-07-15',
      startTime: '10:30',
      endTime: '12:00',
      category: 'work'
    },
    {
      id: 'evt-jul-2',
      userId: 'user-fiona',
      title: 'Sunset Paddle & Stroll',
      date: '2025-07-15',
      startTime: '18:00',
      endTime: '19:30',
      category: 'personal'
    },

    {
      id: 'evt-aug-1',
      userId: 'user-fiona',
      title: 'Fall Semester Kickoff & Syllabus Review',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:30',
      category: 'class'
    },
    {
      id: 'evt-aug-2',
      userId: 'user-fiona',
      title: 'Coffee Catchup with Mentor',
      date: '2025-08-20',
      startTime: '14:30',
      endTime: '16:00',
      category: 'meeting'
    },

    {
      id: 'evt-oct-1',
      userId: 'user-fiona',
      title: 'Autumn Trail Walk',
      date: '2025-10-15',
      startTime: '15:00',
      endTime: '17:00',
      category: 'personal'
    },

    {
      id: 'evt-nov-1',
      userId: 'user-fiona',
      title: 'Thanksgiving Gathering & Cooking',
      date: '2025-11-19',
      startTime: '17:00',
      endTime: '20:00',
      category: 'social'
    },

    {
      id: 'evt-dec-1',
      userId: 'user-fiona',
      title: 'Holiday Celebration & Retrospective',
      date: '2025-12-17',
      startTime: '16:00',
      endTime: '19:00',
      category: 'social',
      annotation: 'Celebrate 2025!'
    }
  ];

  return { todos, events };
}
