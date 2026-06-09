import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateHabit, useUpdateHabit } from '@/hooks/useAgenda'
import { Habit } from '@/types/agenda'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Habit | null
}

export function HabitForm({ open, onClose, editing }: Props) {
  const create = useCreateHabit()
  const update = useUpdateHabit()

  const [name, setName]                 = useState('')
  const [trackingType, setTrackingType] = useState<'boolean' | 'scale'>('boolean')
  const [frequency, setFrequency]       = useState<'daily' | 'weekly'>('daily')
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setTrackingType(editing.tracking_type)
      setFrequency(editing.frequency)
    } else {
      setName('')
      setTrackingType('boolean')
      setFrequency('daily')
    }
  }, [editing, open])

  async function handleSubmit() {
    if (!name.trim()) return
    const payload = {
      name: name.trim(),
      tracking_type: trackingType,
      frequency,
      active: true,
    }
    try {
      setError(null)
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
      } else {
        await create.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.')
      console.error('HabitForm error:', err)
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar hábito' : 'Novo hábito'}>
      <FormField label="Nome">
        <input className={inputClass} placeholder="Ex: Leitura, Água, Meditação"
          value={name} onChange={e => setName(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Tipo de registro">
        <select className={selectClass} value={trackingType}
          onChange={e => setTrackingType(e.target.value as 'boolean' | 'scale')}>
          <option value="boolean">Sim / Não</option>
          <option value="scale">Escala 1–5</option>
        </select>
      </FormField>
      <FormField label="Frequência">
        <select className={selectClass} value={frequency}
          onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}>
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
        </select>
      </FormField>
      <button onClick={handleSubmit} disabled={!name.trim() || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar hábito'}
      </button>
      {error && <p className="text-[12px] text-[#e24b4a] text-center mt-2">{error}</p>}
    </BottomSheet>
  )
}
