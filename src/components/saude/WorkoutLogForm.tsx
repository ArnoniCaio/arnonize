import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateWorkoutLog, useWorkoutTemplates, useTemplateExercises } from '@/hooks/useSaude'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate: Date
}

interface SetInput {
  exercise_name: string
  set_number: number
  reps: string
  weight_kg: string
}

export function WorkoutLogForm({ open, onClose, defaultDate }: Props) {
  const create = useCreateWorkoutLog()
  const { data: templates = [] } = useWorkoutTemplates()

  const [templateId, setTemplateId] = useState<string>('')
  const [date, setDate]             = useState(format(defaultDate, 'yyyy-MM-dd'))
  const [duration, setDuration]     = useState('')
  const [effort, setEffort]         = useState('7')
  const [notes, setNotes]           = useState('')
  const [sets, setSets]             = useState<SetInput[]>([])

  const { data: templateExercises = [] } = useTemplateExercises(templateId || null)

  useEffect(() => {
    if (templateExercises.length > 0) {
      const newSets: SetInput[] = []
      templateExercises.forEach(ex => {
        const numSets = ex.default_sets ?? 3
        for (let s = 1; s <= numSets; s++) {
          newSets.push({
            exercise_name: ex.exercise_name,
            set_number: s,
            reps: ex.default_reps?.toString() ?? '',
            weight_kg: ex.default_weight_kg?.toString() ?? '',
          })
        }
      })
      setSets(newSets)
    } else if (!templateId) {
      setSets([])
    }
  }, [templateExercises, templateId])

  useEffect(() => {
    if (open) setDate(format(defaultDate, 'yyyy-MM-dd'))
  }, [open, defaultDate])

  function updateSet(i: number, field: 'reps' | 'weight_kg', value: string) {
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const exercises = [...new Set(sets.map(s => s.exercise_name))]

  async function handleSubmit() {
    await create.mutateAsync({
      log: {
        template_id: templateId || null,
        date, notes: notes.trim() || null,
        duration_minutes: duration ? parseInt(duration) : null,
        perceived_effort: effort ? parseInt(effort) : null,
      },
      sets: sets.map(s => ({
        exercise_name: s.exercise_name,
        set_number: s.set_number,
        reps: s.reps ? parseInt(s.reps) : null,
        weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
      }))
    })
    setTemplateId(''); setDuration(''); setEffort('7'); setNotes(''); setSets([])
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Registrar treino">
      <FormField label="Ficha">
        <select className={selectClass} value={templateId}
          onChange={e => setTemplateId(e.target.value)}>
          <option value="">Treino livre</option>
          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </FormField>

      <div className="flex gap-3 w-full mb-4">
        <div className="flex-1 min-w-0">
          <FormField label="Data">
            <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Duração (min)">
            <input type="number" className={inputClass} placeholder="60"
              value={duration} onChange={e => setDuration(e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">
          Esforço percebido — {effort}/10
        </p>
        <input type="range" min="1" max="10" value={effort}
          onChange={e => setEffort(e.target.value)}
          className="w-full accent-[#6366f1]" />
      </div>

      {exercises.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-3">Exercícios</p>
          {exercises.map(exName => (
            <div key={exName} className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-3 mb-3">
              <p className="text-[13px] font-semibold text-[#e2e2f0] mb-2">{exName}</p>
              <div className="flex gap-2 mb-1">
                <p className="text-[10px] text-[#3a3a50] w-8 text-center">Série</p>
                <p className="text-[10px] text-[#3a3a50] flex-1 text-center">Reps</p>
                <p className="text-[10px] text-[#3a3a50] flex-1 text-center">Carga (kg)</p>
              </div>
              {sets.filter(s => s.exercise_name === exName).map((s, idx) => {
                const globalIdx = sets.findIndex(gs => gs.exercise_name === exName && gs.set_number === s.set_number)
                return (
                  <div key={idx} className="flex gap-2 mb-1.5 items-center">
                    <span className="text-[12px] text-[#6b6b80] w-8 text-center">{s.set_number}</span>
                    <input type="number" inputMode="numeric" placeholder="12"
                      value={s.reps} onChange={e => updateSet(globalIdx, 'reps', e.target.value)}
                      className="flex-1 bg-[#0a0a0f] border border-[#1e1e32] rounded-lg h-9 text-center text-[13px] text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]" />
                    <input type="number" inputMode="decimal" placeholder="0"
                      value={s.weight_kg} onChange={e => updateSet(globalIdx, 'weight_kg', e.target.value)}
                      className="flex-1 bg-[#0a0a0f] border border-[#1e1e32] rounded-lg h-9 text-center text-[13px] text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]" />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <FormField label="Notas">
        <input className={inputClass} placeholder="Opcional"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </FormField>

      <button onClick={handleSubmit} disabled={create.isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {create.isPending ? 'Salvando...' : 'Salvar treino'}
      </button>
    </BottomSheet>
  )
}
