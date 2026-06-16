export interface DailyCheckin {
  id: string
  user_id: string
  date: string
  mood: number | null
  energy: number | null
  sleep_hours: number | null
  notes: string | null
  created_at: string
}

export interface BodyMetric {
  id: string
  user_id: string
  date: string
  weight_kg:  number | null
  waist_cm:   number | null
  hip_cm:     number | null
  chest_cm:   number | null
  arm_cm:     number | null
  thigh_cm:   number | null
  photo_ref:  string | null
  created_at: string
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export interface TemplateExercise {
  id: string
  user_id: string
  template_id: string
  exercise_name: string
  default_sets: number | null
  default_reps: number | null
  default_weight_kg: number | null
  sort_order: number
}

export interface WorkoutLog {
  id: string
  user_id: string
  template_id: string | null
  date: string
  duration_minutes: number | null
  perceived_effort: number | null
  notes: string | null
  created_at: string
}

export interface WorkoutSet {
  id: string
  user_id: string
  workout_log_id: string
  exercise_name: string
  set_number: number
  reps: number | null
  weight_kg: number | null
}

export interface ActiveSet {
  exercise_name: string
  set_number: number
  reps: string
  weight_kg: string
  done: boolean
}

export interface ActiveWorkout {
  templateId: string | null
  templateName: string
  startedAt: Date
  sets: ActiveSet[]
}

export interface ExamResult {
  id: string
  user_id: string
  date: string
  title: string
  notes: string | null
  file_path: string | null
  file_type: 'pdf' | 'image' | null
  created_at: string
}
