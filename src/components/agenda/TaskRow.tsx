import { Task } from '@/types/agenda'
import { useToggleTask, useDeleteTask } from '@/hooks/useAgenda'
import { SwipeableRow } from '@/components/ui/SwipeableRow'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onTap: (task: Task) => void
}

const PRIORITY_STYLES = {
  high:   { bg: 'bg-[#2d1515]', text: 'text-[#f09595]', label: 'Alta' },
  medium: { bg: 'bg-[#2e2010]', text: 'text-[#ef9f27]', label: 'Média' },
  low:    { bg: 'bg-[#13131f]', text: 'text-[#6b6b80]',  label: 'Baixa' },
}

export function TaskRow({ task, onEdit, onTap }: Props) {
  const toggle = useToggleTask()
  const deleteTask = useDeleteTask()
  const pri = PRIORITY_STYLES[task.priority]

  return (
    <SwipeableRow
      actions={[
        { icon: 'ti-pencil', color: 'var(--swipe-edit-color)',   bg: 'var(--swipe-edit-bg)',   onPress: () => onEdit(task) },
        { icon: 'ti-trash',  color: 'var(--swipe-delete-color)', bg: 'var(--swipe-delete-bg)', onPress: () => deleteTask.mutate(task.id) },
      ]}
    >
      <div className="flex items-center gap-3 py-2.5 border-b border-[#13131f] bg-[#0a0a0f]">
        <button
          onClick={e => { e.stopPropagation(); toggle.mutate({ id: task.id, completed: !task.completed }) }}
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
            task.completed ? 'bg-[#6366f1] border-[#6366f1]' : 'border-[#3a3a50]'
          }`}
        >
          {task.completed && <i className="ti ti-check text-white" style={{ fontSize: 11 }} />}
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0" onClick={() => onTap(task)}>
          <p className={`flex-1 text-[13px] truncate ${task.completed ? 'line-through text-[#3a3a50]' : 'text-[#a5a5c0]'}`}>
            {task.title}
          </p>
          {!task.completed && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${pri.bg} ${pri.text}`}>
              {pri.label}
            </span>
          )}
        </div>
      </div>
    </SwipeableRow>
  )
}
