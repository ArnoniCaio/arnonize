import { Task } from '@/types/agenda'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToggleTask } from '@/hooks/useAgenda'

interface Props {
  task: Task | null
  onClose: () => void
  onEdit: (task: Task) => void
}

const PRIORITY_STYLES = {
  high:   { bg: 'bg-[#2d1515]', text: 'text-[#f09595]', label: 'Alta' },
  medium: { bg: 'bg-[#2e2010]', text: 'text-[#ef9f27]', label: 'Média' },
  low:    { bg: 'bg-[#13131f]', text: 'text-[#6b6b80]',  label: 'Baixa' },
}

export function TaskDetail({ task, onClose, onEdit }: Props) {
  const toggle = useToggleTask()
  if (!task) return null

  const pri = PRIORITY_STYLES[task.priority]
  const dueDateStr = task.due_date
    ? format(new Date(task.due_date + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })
    : null
  const estimatedStr = task.estimated_minutes
    ? task.estimated_minutes >= 60
      ? `${Math.floor(task.estimated_minutes / 60)}h${task.estimated_minutes % 60 > 0 ? task.estimated_minutes % 60 + 'min' : ''}`
      : `${task.estimated_minutes}min`
    : null

  return (
    <BottomSheet open={!!task} onClose={onClose} title="Tarefa">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggle.mutate({ id: task.id, completed: !task.completed })}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              task.completed ? 'bg-[#6366f1] border-[#6366f1]' : 'border-[#3a3a50]'
            }`}
          >
            {task.completed && <i className="ti ti-check text-white" style={{ fontSize: 12 }} />}
          </button>
          <div className="flex-1">
            <p className={`text-[20px] font-semibold leading-snug ${task.completed ? 'line-through text-[#3a3a50]' : 'text-[#e2e2f0]'}`}>
              {task.title}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
            <i className="ti ti-flag text-[#6366f1]" style={{ fontSize: 18 }} />
            <p className="text-[14px] text-[#a5a5c0]">Prioridade</p>
            <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded ${pri.bg} ${pri.text}`}>
              {pri.label}
            </span>
          </div>
          {dueDateStr && (
            <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
              <i className="ti ti-calendar-due text-[#6366f1]" style={{ fontSize: 18 }} />
              <p className="text-[14px] text-[#a5a5c0] capitalize">{dueDateStr}</p>
            </div>
          )}
          {estimatedStr && (
            <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
              <i className="ti ti-clock text-[#6366f1]" style={{ fontSize: 18 }} />
              <p className="text-[14px] text-[#a5a5c0]">Tempo estimado · {estimatedStr}</p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(task), 150) }}
        className="w-full bg-[#1a1a2e] border border-[#6366f1] text-[#6366f1] rounded-xl py-3 text-[14px] font-semibold transition-opacity active:opacity-70"
      >
        <i className="ti ti-pencil mr-2" style={{ fontSize: 14 }} />
        Editar tarefa
      </button>
    </BottomSheet>
  )
}
