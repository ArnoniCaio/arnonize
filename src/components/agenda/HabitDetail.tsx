import { Habit, HabitLog } from '@/types/agenda'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  habit: Habit | null
  log: HabitLog | undefined
  onClose: () => void
  onEdit: (habit: Habit) => void
}

export function HabitDetail({ habit, log, onClose, onEdit }: Props) {
  if (!habit) return null

  const freqLabel = habit.frequency === 'daily' ? 'Diário' : 'Semanal'
  const typeLabel = habit.tracking_type === 'boolean' ? 'Sim / Não' : 'Escala 1–5'
  const statusLabel = habit.tracking_type === 'boolean'
    ? log?.completed ? 'Feito hoje ✓' : 'Pendente hoje'
    : log?.score ? `Score hoje: ${log.score}/5` : 'Sem registro hoje'

  return (
    <BottomSheet open={!!habit} onClose={onClose} title="Hábito">
      <div className="flex flex-col gap-4 mb-6">
        <p className="text-[20px] font-semibold text-[#e2e2f0]">{habit.name}</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
            <i className="ti ti-repeat text-[#6366f1]" style={{ fontSize: 18 }} />
            <p className="text-[14px] text-[#a5a5c0]">Frequência</p>
            <span className="ml-auto text-[13px] text-[#e2e2f0] font-medium">{freqLabel}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
            <i className="ti ti-chart-bar text-[#6366f1]" style={{ fontSize: 18 }} />
            <p className="text-[14px] text-[#a5a5c0]">Tipo de registro</p>
            <span className="ml-auto text-[13px] text-[#e2e2f0] font-medium">{typeLabel}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
            <i className="ti ti-star text-[#6366f1]" style={{ fontSize: 18 }} />
            <p className="text-[14px] text-[#a5a5c0]">{statusLabel}</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(habit), 150) }}
        className="w-full bg-[#1a1a2e] border border-[#6366f1] text-[#6366f1] rounded-xl py-3 text-[14px] font-semibold transition-opacity active:opacity-70"
      >
        <i className="ti ti-pencil mr-2" style={{ fontSize: 14 }} />
        Editar hábito
      </button>
    </BottomSheet>
  )
}
