import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, getCurrentUserId } from '@/lib/supabase'
import { Event, Task, Habit, HabitLog } from '@/types/agenda'
import { format } from 'date-fns'

export function useEvents(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['events', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_date', dateStr)
        .order('start_time', { ascending: true })
      if (error) throw error
      return data as Event[]
    }
  })
}

export function useTasks(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['tasks', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('due_date', dateStr)
        .order('priority', { ascending: false })
      if (error) throw error
      return data as Task[]
    }
  })
}

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('active', true)
        .order('created_at')
      if (error) throw error
      return data as Habit[]
    }
  })
}

export function useHabitLogs(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['habit_logs', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', dateStr)
      if (error) throw error
      return data as HabitLog[]
    }
  })
}

export function useToggleTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      habit_id, date, completed, score
    }: { habit_id: string; date: string; completed?: boolean; score?: number }) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('habit_logs')
        .upsert({ habit_id, date, completed, score, user_id: userId }, { onConflict: 'habit_id,date' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit_logs'] })
      qc.invalidateQueries({ queryKey: ['habit_streak'] })
    }
  })
}

function calcStreak(logs: { date: string; completed: boolean | null; score: number | null }[]): number {
  const done = new Set(
    logs.filter(l => l.completed === true || (l.score ?? 0) > 0).map(l => l.date)
  )
  let streak = 0
  const cursor = new Date()
  const todayStr = format(cursor, 'yyyy-MM-dd')
  if (!done.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const ds = format(cursor, 'yyyy-MM-dd')
    if (done.has(ds)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function useHabitStreak(habitId: string) {
  return useQuery({
    queryKey: ['habit_streak', habitId],
    queryFn: async () => {
      const since = format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('habit_logs')
        .select('date, completed, score')
        .eq('habit_id', habitId)
        .gte('date', since)
        .order('date', { ascending: false })
      if (error) throw error
      return calcStreak(data ?? [])
    }
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Event, 'id' | 'user_id' | 'created_at'>) => {
      const userId = await getCurrentUserId()
      const { data: result, error } = await supabase.from('events').insert({ ...data, user_id: userId }).select()
      if (error) {
        console.error('useCreateEvent error:', error)
        throw error
      }
      return result
    },
    onError: (error) => console.error('useCreateEvent mutation error:', error),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] })
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
      const userId = await getCurrentUserId()
      const { data: result, error } = await supabase.from('tasks').insert({ ...data, user_id: userId }).select()
      if (error) {
        console.error('useCreateTask error:', error)
        throw error
      }
      return result
    },
    onError: (error) => console.error('useCreateTask mutation error:', error),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
      const userId = await getCurrentUserId()
      const { data: result, error } = await supabase.from('habits').insert({ ...data, user_id: userId }).select()
      if (error) {
        console.error('useCreateHabit error:', error)
        throw error
      }
      return result
    },
    onError: (error) => console.error('useCreateHabit mutation error:', error),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] })
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Event> & { id: string }) => {
      const { error } = await supabase.from('events').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] })
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] })
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const { error } = await supabase.from('tasks').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Habit> & { id: string }) => {
      const { error } = await supabase.from('habits').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] })
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] })
  })
}
