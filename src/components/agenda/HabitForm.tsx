import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateHabit } from '@/hooks/useAgenda'

interface Props {
  open: boolean
  onClose: () => void
}

export function HabitForm({ open, onClose }: Props) {
  const create = useCreateHabit()
  const [name, setName] = useState('')
  const [trackingType, setTrackingType] = useState<'boolean' | 'scale'>('boolean')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')

  async function handleSubmit() {
    if (!name.trim()) return
    await create.mutateAsync({
      name: name.trim(),
      tracking_type: trackingType,
      frequency,
      active: true,
    })
    setName('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Novo hábito">
      <FormField label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Leitura, Água, Meditação"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </FormField>
      <FormField label="Tipo de registro">
        <select
          className={selectClass}
          value={trackingType}
          onChange={e => setTrackingType(e.target.value as 'boolean' | 'scale')}
        >
          <option value="boolean">Sim / Não</option>
          <option value="scale">Escala 1–5</option>
        </select>
      </FormField>
      <FormField label="Frequência">
        <select
          className={selectClass}
          value={frequency}
          onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}
        >
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
        </select>
      </FormField>
      <button
        onClick={handleSubmit}
        disabled={!name.trim() || create.isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity"
      >
        {create.isPending ? 'Salvando...' : 'Salvar hábito'}
      </button>
    </BottomSheet>
  )
}
