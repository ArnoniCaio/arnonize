import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateRecurring, useUpdateRecurring, useAccounts, useFinanceCategories } from '@/hooks/useFinancas'
import { RecurringTransaction } from '@/types/financas'

interface Props {
  open: boolean
  onClose: () => void
  editing?: RecurringTransaction | null
}

export function RecurringForm({ open, onClose, editing }: Props) {
  const create = useCreateRecurring()
  const update = useUpdateRecurring()
  const { data: accounts = [] }   = useAccounts()
  const { data: categories = [] } = useFinanceCategories()

  const [type, setType]             = useState<'income' | 'expense'>('expense')
  const [amount, setAmount]         = useState('')
  const [description, setDesc]      = useState('')
  const [dayOfMonth, setDay]        = useState('1')
  const [accountId, setAccountId]   = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    if (editing) {
      setType(editing.type); setAmount(editing.amount.toString())
      setDesc(editing.description); setDay(editing.day_of_month.toString())
      setAccountId(editing.account_id); setCategoryId(editing.category_id ?? '')
    } else {
      setType('expense'); setAmount(''); setDesc(''); setDay('1')
      setAccountId(accounts[0]?.id ?? ''); setCategoryId('')
    }
  }, [editing, open, accounts])

  async function handleSubmit() {
    if (!amount || !description.trim() || !accountId) return
    const payload = {
      type, amount: parseFloat(amount.replace(',', '.')),
      description: description.trim(),
      day_of_month: parseInt(dayOfMonth),
      recurrence: 'monthly' as const,
      account_id: accountId,
      category_id: categoryId || null,
      active: true,
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar fixo' : 'Novo fixo'}>
      <div className="flex gap-2 mb-4">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
              type === t
                ? t === 'expense' ? 'bg-[#2d1515] text-[#f09595]' : 'bg-[#0d3330] text-[#1d9e75]'
                : 'bg-[#13131f] text-[#6b6b80]'
            }`}>
            {t === 'expense' ? 'Gasto fixo' : 'Ganho fixo'}
          </button>
        ))}
      </div>
      <FormField label="Descrição">
        <input className={inputClass} placeholder="Ex: Aluguel, Salário"
          value={description} onChange={e => setDesc(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Valor (R$)">
        <input className={inputClass} placeholder="0,00" inputMode="decimal"
          value={amount} onChange={e => setAmount(e.target.value)} />
      </FormField>
      <div className="flex gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Dia do mês">
            <input type="number" className={inputClass} min="1" max="31" placeholder="1"
              value={dayOfMonth} onChange={e => setDay(e.target.value)} />
          </FormField>
        </div>
        <div className="flex-1 min-w-0">
          <FormField label="Conta">
            <select className={selectClass} value={accountId} onChange={e => setAccountId(e.target.value)}>
              <option value="">Selecione</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </FormField>
        </div>
      </div>
      <FormField label="Categoria">
        <select className={selectClass} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Sem categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <button onClick={handleSubmit} disabled={!amount || !description.trim() || !accountId || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar fixo'}
      </button>
    </BottomSheet>
  )
}
