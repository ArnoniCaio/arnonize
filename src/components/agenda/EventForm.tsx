import { useState } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useCreateEvent } from '@/hooks/useAgenda'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate: Date
}

export function EventForm({ open, onClose, defaultDate }: Props) {
  const create = useCreateEvent()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(defaultDate, 'yyyy-MM-dd'))
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('')

  async function handleSubmit() {
    if (!title.trim()) return
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      event_date: date,
      start_time: time || null,
      duration_minutes: duration ? parseInt(duration) : null,
      category_id: null,
      recurrence: null,
      recurrence_end: null,
    })
    setTitle(''); setDescription(''); setTime(''); setDuration('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Novo evento">
      <FormField label="Título">
        <input
          className={inputClass}
          placeholder="Ex: Reunião de equipe"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField label="Descrição">
        <input
          className={inputClass}
          placeholder="Opcional"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </FormField>
      <FormField label="Data">
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </FormField>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Horário">
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Duração (min)">
            <input
              type="number"
              className={inputClass}
              placeholder="60"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </FormField>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || create.isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity"
      >
        {create.isPending ? 'Salvando...' : 'Salvar evento'}
      </button>
    </BottomSheet>
  )
}
