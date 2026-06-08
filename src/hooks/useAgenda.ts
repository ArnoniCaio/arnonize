import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
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
      const { error } = await supabase
        .from('habit_logs')
        .upsert({ habit_id, date, completed, score }, { onConflict: 'habit_id,date' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit_logs'] })
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Event, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('events').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] })
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Task, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('tasks').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Habit, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('habits').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] })
  })
}
