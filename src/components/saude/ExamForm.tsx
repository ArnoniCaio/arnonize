import { useRef, useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useCreateExamResult } from '@/hooks/useSaude'
import { format } from 'date-fns'

const MAX_SIZE_MB = 10

interface Props {
  open: boolean
  onClose: () => void
}

export function ExamForm({ open, onClose }: Props) {
  const create = useCreateExamResult()
  const fileRef = useRef<HTMLInputElement>(null)

  const [date, setDate]   = useState(format(new Date(), 'yyyy-MM-dd'))
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile]   = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    if (!selected) return
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo permitido: ${MAX_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }
    setError(null)
    setFile(selected)
  }

  async function handleSubmit() {
    if (!title.trim() || !file) return
    try {
      setError(null)
      await create.mutateAsync({ date, title: title.trim(), notes: notes.trim() || null, file })
      setTitle(''); setNotes(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      onClose()
    } catch (err) {
      setError('Erro ao enviar. Tente novamente.')
      console.error('ExamForm error:', err)
    }
  }

  const canSubmit = title.trim() && file && !create.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title="Novo exame">
      <FormField label="Data">
        <input type="date" className={inputClass} value={date}
          onChange={e => setDate(e.target.value)} />
      </FormField>

      <FormField label="Título">
        <input type="text" className={inputClass} placeholder="Ex: Hemograma completo"
          value={title} onChange={e => setTitle(e.target.value)} />
      </FormField>

      <FormField label="Notas (opcional)">
        <textarea className={`${inputClass} resize-none`} rows={3}
          placeholder="Observações, laboratório, médico..."
          value={notes} onChange={e => setNotes(e.target.value)} />
      </FormField>

      <FormField label="Arquivo (PDF ou imagem)">
        <label className={`${inputClass} flex items-center gap-3 cursor-pointer`}>
          <i className="ti ti-upload text-[#6366f1]" style={{ fontSize: 18 }} />
          <span className={`flex-1 truncate text-[13px] ${file ? 'text-[#e2e2f0]' : 'text-[#3a3a50]'}`}>
            {file ? file.name : 'Selecionar arquivo...'}
          </span>
          <input ref={fileRef} type="file" accept="application/pdf,image/*"
            className="hidden" onChange={handleFileChange} />
        </label>
      </FormField>

      <button onClick={handleSubmit} disabled={!canSubmit}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {create.isPending ? 'Enviando...' : 'Salvar exame'}
      </button>

      {error && <p className="text-[12px] text-[#e24b4a] text-center mt-2">{error}</p>}
    </BottomSheet>
  )
}
