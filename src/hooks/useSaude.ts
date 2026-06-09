import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, getCurrentUserId } from '@/lib/supabase'
import { DailyCheckin, BodyMetric, WorkoutTemplate, TemplateExercise, WorkoutLog, WorkoutSet } from '@/types/saude'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function useTodayCheckin(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['daily_checkin', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins').select('*').eq('date', dateStr).maybeSingle()
      if (error) throw error
      return data as DailyCheckin | null
    }
  })
}

export function useCheckinHistory() {
  return useQuery({
    queryKey: ['checkin_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins').select('*')
        .order('date', { ascending: false }).limit(30)
      if (error) throw error
      return data as DailyCheckin[]
    }
  })
}

export function useCheckinsByMonth(year: number, month: number) {
  const date  = new Date(year, month, 1)
  const start = format(startOfMonth(date), 'yyyy-MM-dd')
  const end   = format(endOfMonth(date),   'yyyy-MM-dd')
  return useQuery({
    queryKey: ['checkin_month', year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins').select('*')
        .gte('date', start).lte('date', end)
        .order('date', { ascending: true })
      if (error) throw error
      return data as DailyCheckin[]
    }
  })
}

export function useWorkoutTemplates() {
  return useQuery({
    queryKey: ['workout_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates').select('*').order('created_at')
      if (error) throw error
      return data as WorkoutTemplate[]
    }
  })
}

export function useTemplateExercises(templateId: string | null) {
  return useQuery({
    queryKey: ['template_exercises', templateId],
    enabled: !!templateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_exercises').select('*')
        .eq('template_id', templateId!).order('sort_order')
      if (error) throw error
      return data as TemplateExercise[]
    }
  })
}

export function useWorkoutLogs(month: Date) {
  const start = format(startOfMonth(month), 'yyyy-MM-dd')
  const end   = format(endOfMonth(month),   'yyyy-MM-dd')
  return useQuery({
    queryKey: ['workout_logs', start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs').select('*')
        .gte('date', start).lte('date', end)
        .order('date', { ascending: false })
      if (error) throw error
      return data as WorkoutLog[]
    }
  })
}

export function useWorkoutSets(workoutLogId: string | null) {
  return useQuery({
    queryKey: ['workout_sets', workoutLogId],
    enabled: !!workoutLogId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sets').select('*')
        .eq('workout_log_id', workoutLogId!).order('set_number')
      if (error) throw error
      return data as WorkoutSet[]
    }
  })
}

export function useBodyMetrics() {
  return useQuery({
    queryKey: ['body_metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_metrics').select('*')
        .order('date', { ascending: false }).limit(20)
      if (error) throw error
      return data as BodyMetric[]
    }
  })
}

export function useUpsertCheckin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<DailyCheckin, 'id' | 'user_id' | 'created_at'>) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('daily_checkins').upsert({ ...data, user_id: userId }, { onConflict: 'user_id,date' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily_checkin'] })
      qc.invalidateQueries({ queryKey: ['checkin_history'] })
      qc.invalidateQueries({ queryKey: ['checkin_month'] })
    }
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ template, exercises }: {
      template: Omit<WorkoutTemplate, 'id' | 'user_id' | 'created_at'>
      exercises: Omit<TemplateExercise, 'id' | 'user_id' | 'template_id'>[]
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('workout_templates').insert({ ...template, user_id: userId }).select().single()
      if (error) throw error
      if (exercises.length > 0) {
        const { error: exError } = await supabase.from('template_exercises').insert(
          exercises.map(e => ({ ...e, template_id: data.id }))
        )
        if (exError) throw exError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout_templates'] })
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_templates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout_templates'] })
  })
}

export function useCreateWorkoutLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ log, sets }: {
      log: Omit<WorkoutLog, 'id' | 'user_id' | 'created_at'>
      sets: Omit<WorkoutSet, 'id' | 'user_id' | 'workout_log_id'>[]
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('workout_logs').insert({ ...log, user_id: userId }).select().single()
      if (error) throw error
      if (sets.length > 0) {
        const { error: setsError } = await supabase.from('workout_sets').insert(
          sets.map(s => ({ ...s, workout_log_id: data.id }))
        )
        if (setsError) throw setsError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout_logs'] })
  })
}

export function useDeleteWorkoutLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout_logs'] })
  })
}

export function useCreateBodyMetric() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<BodyMetric, 'id' | 'user_id' | 'created_at'>) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase.from('body_metrics').insert({ ...data, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['body_metrics'] })
  })
}
