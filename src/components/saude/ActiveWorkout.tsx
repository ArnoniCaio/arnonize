import { useState } from 'react'
import { ActiveWorkout as ActiveWorkoutType, ActiveSet } from '@/types/saude'
import { useCreateWorkoutLog } from '@/hooks/useSaude'
import { format } from 'date-fns'

interface Props {
  workout: ActiveWorkoutType
  onFinish: () => void
  onCancel: () => void
}

export function ActiveWorkoutScreen({ workout, onFinish, onCancel }: Props) {
  const createLog = useCreateWorkoutLog()
  const [sets, setSets]       = useState<ActiveSet[]>(workout.sets)
  const [effort, setEffort]   = useState(7)
  const [notes, setNotes]     = useState('')
  const [finishing, setFinishing] = useState(false)

  const exercises = [...new Set(sets.map(s => s.exercise_name))]
  const doneSets  = sets.filter(s => s.done).length
  const totalSets = sets.length
  const progress  = totalSets > 0 ? doneSets / totalSets : 0

  function toggleSet(idx: number) {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, done: !s.done } : s))
  }

  function updateSet(idx: number, field: 'reps' | 'weight_kg', value: string) {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function getDuration() {
    return Math.max(1, Math.round((Date.now() - workout.startedAt.getTime()) / 60000))
  }

  async function handleFinish() {
    const doneSetsData = sets.filter(s => s.done)
    await createLog.mutateAsync({
      log: {
        template_id: workout.templateId,
        date: format(new Date(), 'yyyy-MM-dd'),
        duration_minutes: getDuration(),
        perceived_effort: effort,
        notes: notes.trim() || null,
      },
      sets: doneSetsData.map(s => ({
        exercise_name: s.exercise_name,
        set_number: s.set_number,
        reps: s.reps ? parseInt(s.reps) : null,
        weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
      }))
    })
    onFinish()
  }

  if (finishing) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col">
        <div className="pt-12 px-4 pb-4 flex items-center gap-3 border-b border-[#1e1e32]">
          <button onClick={() => setFinishing(false)}
            className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center">
            <i className="ti ti-arrow-left text-[#a5a5c0]" style={{ fontSize: 16 }} />
          </button>
          <p className="text-[17px] font-bold text-[#e2e2f0]">Finalizar treino</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-4 mb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[11px] text-[#6b6b80] uppercase tracking-widest mb-1">Duração</p>
                <p className="text-[20px] font-bold text-[#e2e2f0]">{getDuration()}<span className="text-[13px] text-[#6b6b80]">min</span></p>
              </div>
              <div>
                <p className="text-[11px] text-[#6b6b80] uppercase tracking-widest mb-1">Séries</p>
                <p className="text-[20px] font-bold text-[#e2e2f0]">{doneSets}<span className="text-[13px] text-[#6b6b80]">/{totalSets}</span></p>
              </div>
              <div>
                <p className="text-[11px] text-[#6b6b80] uppercase tracking-widest mb-1">Exercícios</p>
                <p className="text-[20px] font-bold text-[#e2e2f0]">{exercises.length}</p>
              </div>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-3">
              Esforço percebido — {effort}/10
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(v => (
                <button key={v} onClick={() => setEffort(v)}
                  className="flex-1 h-9 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{
                    background: v <= effort ? '#6366f122' : '#13131f',
                    color: v <= effort ? '#6366f1' : '#3a3a50',
                    border: `1px solid ${v <= effort ? '#6366f1' : '#1e1e32'}`
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">Notas</p>
            <textarea placeholder="Como foi o treino?" value={notes}
              onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-[#13131f] border border-[#1e1e32] rounded-xl px-3 py-3 text-[14px] text-[#e2e2f0] placeholder-[#3a3a50] focus:outline-none focus:border-[#6366f1] resize-none" />
          </div>
        </div>
        <div className="px-4 pb-8 pt-3 border-t border-[#1e1e32]">
          <button onClick={handleFinish} disabled={createLog.isPending}
            className="w-full bg-[#1d9e75] text-white rounded-xl py-4 text-[15px] font-bold disabled:opacity-40">
            {createLog.isPending ? 'Salvando...' : '✓ Concluir treino'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col">
      <div className="pt-12 px-4 pb-3 border-b border-[#1e1e32]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[17px] font-bold text-[#e2e2f0] truncate flex-1 mr-3">{workout.templateName}</p>
          <button onClick={onCancel}
            className="text-[12px] text-[#6b6b80] border border-[#1e1e32] rounded-lg px-3 py-1.5 active:opacity-70">
            Cancelar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#13131f] rounded-full overflow-hidden">
            <div className="h-full bg-[#6366f1] rounded-full transition-all"
              style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="text-[11px] text-[#6b6b80]">{doneSets}/{totalSets}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {exercises.map(exName => {
          const exSets = sets.map((s, idx) => ({ ...s, idx })).filter(s => s.exercise_name === exName)
          const allDone = exSets.every(s => s.done)
          return (
            <div key={exName} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <p className={`text-[14px] font-semibold flex-1 ${allDone ? 'text-[#3a3a50] line-through' : 'text-[#e2e2f0]'}`}>
                  {exName}
                </p>
                {allDone && <i className="ti ti-circle-check text-[#1d9e75]" style={{ fontSize: 18 }} />}
              </div>
              <div className="flex gap-2 mb-1 px-1">
                <p className="text-[10px] text-[#3a3a50] w-8 text-center">Série</p>
                <p className="text-[10px] text-[#3a3a50] flex-1 text-center">Reps</p>
                <p className="text-[10px] text-[#3a3a50] flex-1 text-center">kg</p>
                <div className="w-10" />
              </div>
              {exSets.map(s => (
                <div key={s.idx}
                  className={`flex gap-2 mb-2 items-center rounded-xl px-1 py-1 transition-colors ${s.done ? 'opacity-50' : ''}`}
                >
                  <span className="text-[12px] text-[#6b6b80] w-8 text-center font-medium">{s.set_number}</span>
                  <input type="number" inputMode="numeric" placeholder="—"
                    value={s.reps} onChange={e => updateSet(s.idx, 'reps', e.target.value)}
                    className="flex-1 bg-[#13131f] border border-[#1e1e32] rounded-lg h-10 text-center text-[14px] text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]" />
                  <input type="number" inputMode="decimal" placeholder="—"
                    value={s.weight_kg} onChange={e => updateSet(s.idx, 'weight_kg', e.target.value)}
                    className="flex-1 bg-[#13131f] border border-[#1e1e32] rounded-lg h-10 text-center text-[14px] text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]" />
                  <button onClick={() => toggleSet(s.idx)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      s.done ? 'bg-[#1d9e75]' : 'bg-[#13131f] border border-[#1e1e32]'
                    }`}>
                    <i className="ti ti-check" style={{ fontSize: 16, color: s.done ? '#fff' : '#3a3a50' }} />
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-8 pt-3 border-t border-[#1e1e32]">
        <button onClick={() => setFinishing(true)}
          className="w-full bg-[#6366f1] text-white rounded-xl py-4 text-[15px] font-bold active:opacity-90">
          Finalizar treino
        </button>
      </div>
    </div>
  )
}
