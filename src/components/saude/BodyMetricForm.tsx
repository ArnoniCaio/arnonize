import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useCreateBodyMetric } from '@/hooks/useSaude'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onClose: () => void
}

export function BodyMetricForm({ open, onClose }: Props) {
  const create = useCreateBodyMetric()
  const [date, setDate]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weight, setWeight] = useState('')
  const [waist, setWaist]   = useState('')
  const [hip, setHip]       = useState('')
  const [chest, setChest]   = useState('')
  const [arm, setArm]       = useState('')
  const [thigh, setThigh]   = useState('')

  async function handleSubmit() {
    if (!weight && !waist && !hip && !chest && !arm && !thigh) return
    await create.mutateAsync({
      date,
      weight_kg: weight ? parseFloat(weight) : null,
      waist_cm:  waist  ? parseFloat(waist)  : null,
      hip_cm:    hip    ? parseFloat(hip)    : null,
      chest_cm:  chest  ? parseFloat(chest)  : null,
      arm_cm:    arm    ? parseFloat(arm)    : null,
      thigh_cm:  thigh  ? parseFloat(thigh)  : null,
      photo_ref: null,
    })
    setWeight(''); setWaist(''); setHip('')
    setChest(''); setArm(''); setThigh('')
    onClose()
  }

  const hasData = weight || waist || hip || chest || arm || thigh

  return (
    <BottomSheet open={open} onClose={onClose} title="Métricas corporais">
      <FormField label="Data">
        <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
      </FormField>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Peso (kg)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="70.0"
              value={weight} onChange={e => setWeight(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Cintura (cm)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="80"
              value={waist} onChange={e => setWaist(e.target.value)} />
          </FormField>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Quadril (cm)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="95"
              value={hip} onChange={e => setHip(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Peito (cm)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="100"
              value={chest} onChange={e => setChest(e.target.value)} />
          </FormField>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Braço (cm)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="35"
              value={arm} onChange={e => setArm(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Coxa (cm)">
            <input type="number" inputMode="decimal" className={inputClass} placeholder="55"
              value={thigh} onChange={e => setThigh(e.target.value)} />
          </FormField>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={create.isPending || !hasData}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {create.isPending ? 'Salvando...' : 'Salvar métricas'}
      </button>
    </BottomSheet>
  )
}
