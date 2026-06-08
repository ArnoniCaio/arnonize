import { useState } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateTask } from '@/hooks/useAgenda'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate: Date
}

export function TaskForm({ open, onClose, defaultDate }: Props) {
  const create = useCreateTask()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState(format(defaultDate, 'yyyy-MM-dd'))
  const [estimated, setEstimated] = useState('')

  async function handleSubmit() {
    if (!title.trim()) return
    await create.mutateAsync({
      title: title.trim(),
      priority,
      due_date: dueDate,
      estimated_minutes: estimated ? parseInt(estimated) : null,
      completed: false,
      category_id: null,
      recurrence: null,
      recurrence_end: null,
    })
    setTitle(''); setEstimated('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nova tarefa">
      <FormField label="Título">
        <input
          className={inputClass}
          placeholder="Ex: Enviar proposta"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField label="Prioridade">
        <select
          className={selectClass}
          value={priority}
          onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        >
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </FormField>
      <div className="flex gap-3">
        <div className="flex-1">
          <FormField label="Prazo">
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex-1">
          <FormField label="Tempo estimado (min)">
            <input
              type="number"
              className={inputClass}
              placeholder="30"
              value={estimated}
              onChange={e => setEstimated(e.target.value)}
            />
          </FormField>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || create.isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity"
      >
        {create.isPending ? 'Salvando...' : 'Salvar tarefa'}
      </button>
    </BottomSheet>
  )
}
