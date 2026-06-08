import { Task } from '@/types/agenda'
import { useToggleTask } from '@/hooks/useAgenda'

const PRIORITY_STYLES = {
  high:   { bg: 'bg-[#2d1515]', text: 'text-[#f09595]', label: 'Alta' },
  medium: { bg: 'bg-[#2e2010]', text: 'text-[#ef9f27]', label: 'Média' },
  low:    { bg: 'bg-[#13131f]', text: 'text-[#6b6b80]', label: 'Baixa' },
}

interface Props { task: Task }

export function TaskRow({ task }: Props) {
  const toggle = useToggleTask()
  const pri = PRIORITY_STYLES[task.priority]

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#13131f]">
      <button
        onClick={() => toggle.mutate({ id: task.id, completed: !task.completed })}
        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
          task.completed
            ? 'bg-[#6366f1] border-[#6366f1]'
            : 'border-[#3a3a50] bg-transparent'
        }`}
      >
        {task.completed && <i className="ti ti-check text-white" style={{ fontSize: 11 }} />}
      </button>
      <p className={`flex-1 text-[13px] ${task.completed ? 'line-through text-[#3a3a50]' : 'text-[#a5a5c0]'}`}>
        {task.title}
      </p>
      {!task.completed && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${pri.bg} ${pri.text}`}>
          {pri.label}
        </span>
      )}
    </div>
  )
}
