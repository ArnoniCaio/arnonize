import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useCreateEvent, useUpdateEvent } from '@/hooks/useAgenda'
import { Event } from '@/types/agenda'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate: Date
  editing?: Event | null
}

export function EventForm({ open, onClose, defaultDate, editing }: Props) {
  const create = useCreateEvent()
  const update = useUpdateEvent()

  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [date, setDate]         = useState(format(defaultDate, 'yyyy-MM-dd'))
  const [time, setTime]         = useState('')
  const [duration, setDuration] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setDesc(editing.description ?? '')
      setDate(editing.event_date)
      setTime(editing.start_time?.slice(0, 5) ?? '')
      setDuration(editing.duration_minutes?.toString() ?? '')
    } else {
      setTitle(''); setDesc(''); setTime(''); setDuration('')
      setDate(format(defaultDate, 'yyyy-MM-dd'))
    }
  }, [editing, open])

  async function handleSubmit() {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: date,
      start_time: time || null,
      duration_minutes: duration ? parseInt(duration) : null,
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
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar evento' : 'Novo evento'}>
      <FormField label="Título">
        <input className={inputClass} placeholder="Ex: Reunião de equipe"
          value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Descrição">
        <input className={inputClass} placeholder="Opcional"
          value={description} onChange={e => setDesc(e.target.value)} />
      </FormField>
      <FormField label="Data">
        <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
      </FormField>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Horário">
            <input type="time" className={inputClass} value={time} onChange={e => setTime(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Duração (min)">
            <input type="number" className={inputClass} placeholder="60"
              value={duration} onChange={e => setDuration(e.target.value)} />
          </FormField>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!title.trim() || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar evento'}
      </button>
    </BottomSheet>
  )
}
