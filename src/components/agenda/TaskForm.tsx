import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateTask, useUpdateTask } from '@/hooks/useAgenda'
import { Task } from '@/types/agenda'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate: Date
  editing?: Task | null
}

export function TaskForm({ open, onClose, defaultDate, editing }: Props) {
  const create = useCreateTask()
  const update = useUpdateTask()

  const [title, setTitle]         = useState('')
  const [priority, setPriority]   = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate]     = useState(format(defaultDate, 'yyyy-MM-dd'))
  const [estimated, setEstimated] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setPriority(editing.priority)
      setDueDate(editing.due_date ?? format(defaultDate, 'yyyy-MM-dd'))
      setEstimated(editing.estimated_minutes?.toString() ?? '')
    } else {
      setTitle(''); setEstimated('')
      setPriority('medium')
      setDueDate(format(defaultDate, 'yyyy-MM-dd'))
    }
  }, [editing, open])

  async function handleSubmit() {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      priority,
      due_date: dueDate,
      estimated_minutes: estimated ? parseInt(estimated) : null,
      completed: editing?.completed ?? false,
      category_id: null,
      recurrence: null,
      recurrence_end: null,
    }
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar tarefa' : 'Nova tarefa'}>
      <FormField label="Título">
        <input className={inputClass} placeholder="Ex: Enviar proposta"
          value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Prioridade">
        <select className={selectClass} value={priority}
          onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </FormField>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Prazo">
            <input type="date" className={inputClass} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Tempo estimado (min)">
            <input type="number" className={inputClass} placeholder="30"
              value={estimated} onChange={e => setEstimated(e.target.value)} />
          </FormField>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!title.trim() || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar tarefa'}
      </button>
    </BottomSheet>
  )
}
