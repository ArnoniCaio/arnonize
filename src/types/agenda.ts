export interface Event {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  duration_minutes: number | null
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  recurrence_end: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  title: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  estimated_minutes: number | null
  completed: boolean
  recurrence: 'daily' | 'weekly' | 'monthly' | null
  recurrence_end: string | null
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  tracking_type: 'boolean' | 'scale'
  frequency: 'daily' | 'weekly'
  active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  date: string
  completed: boolean | null
  score: number | null
  notes: string | null
}
