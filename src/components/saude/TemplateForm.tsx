import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useCreateTemplate } from '@/hooks/useSaude'

interface Props {
  open: boolean
  onClose: () => void
}

interface ExerciseInput {
  exercise_name: string
  default_sets: string
  default_reps: string
  default_weight_kg: string
  sort_order: number
}

export function TemplateForm({ open, onClose }: Props) {
  const create = useCreateTemplate()
  const [name, setName]         = useState('')
  const [description, setDesc]  = useState('')
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { exercise_name: '', default_sets: '3', default_reps: '12', default_weight_kg: '', sort_order: 0 }
  ])

  function addExercise() {
    setExercises(prev => [...prev, {
      exercise_name: '', default_sets: '3', default_reps: '12',
      default_weight_kg: '', sort_order: prev.length
    }])
  }

  function removeExercise(i: number) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateExercise(i: number, field: keyof ExerciseInput, value: string) {
    setExercises(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  async function handleSubmit() {
    if (!name.trim()) return
    const validExercises = exercises.filter(e => e.exercise_name.trim())
    await create.mutateAsync({
      template: { name: name.trim(), description: description.trim() || null },
      exercises: validExercises.map(e => ({
        exercise_name: e.exercise_name.trim(),
        default_sets: e.default_sets ? parseInt(e.default_sets) : null,
        default_reps: e.default_reps ? parseInt(e.default_reps) : null,
        default_weight_kg: e.default_weight_kg ? parseFloat(e.default_weight_kg) : null,
        sort_order: e.sort_order,
      }))
    })
    setName(''); setDesc('')
    setExercises([{ exercise_name: '', default_sets: '3', default_reps: '12', default_weight_kg: '', sort_order: 0 }])
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nova ficha de treino">
      <FormField label="Nome da ficha">
        <input className={inputClass} placeholder="Ex: Treino A — Peito e Tríceps"
          value={name} onChange={e => setName(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Descrição">
        <input className={inputClass} placeholder="Opcional"
          value={description} onChange={e => setDesc(e.target.value)} />
      </FormField>

      <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-3">Exercícios</p>

      {exercises.map((ex, i) => (
        <div key={i} className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[#6b6b80]">Exercício {i + 1}</p>
            {exercises.length > 1 && (
              <button onClick={() => removeExercise(i)}
                className="w-6 h-6 rounded-full bg-[#2d1515] flex items-center justify-center">
                <i className="ti ti-x text-[#f09595]" style={{ fontSize: 11 }} />
              </button>
            )}
          </div>
          <input className={`${inputClass} mb-2`} placeholder="Nome do exercício"
            value={ex.exercise_name} onChange={e => updateExercise(i, 'exercise_name', e.target.value)} />
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#6b6b80] mb-1">Séries</p>
              <input type="number" className={inputClass} placeholder="3"
                value={ex.default_sets} onChange={e => updateExercise(i, 'default_sets', e.target.value)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#6b6b80] mb-1">Reps</p>
              <input type="number" className={inputClass} placeholder="12"
                value={ex.default_reps} onChange={e => updateExercise(i, 'default_reps', e.target.value)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#6b6b80] mb-1">Carga (kg)</p>
              <input type="number" className={inputClass} placeholder="0"
                value={ex.default_weight_kg} onChange={e => updateExercise(i, 'default_weight_kg', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addExercise}
        className="w-full py-2.5 rounded-xl border border-dashed border-[#3a3a50] text-[13px] text-[#6b6b80] mb-4 active:opacity-70">
        <i className="ti ti-plus mr-1" style={{ fontSize: 13 }} />
        Adicionar exercício
      </button>

      <button onClick={handleSubmit} disabled={!name.trim() || create.isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold disabled:opacity-40">
        {create.isPending ? 'Salvando...' : 'Salvar ficha'}
      </button>
    </BottomSheet>
  )
}
