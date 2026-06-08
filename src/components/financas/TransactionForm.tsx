import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateTransaction, useUpdateTransaction, useAccounts, useFinanceCategories } from '@/hooks/useFinancas'
import { Transaction } from '@/types/financas'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Transaction | null
}

export function TransactionForm({ open, onClose, editing }: Props) {
  const create = useCreateTransaction()
  const update = useUpdateTransaction()
  const { data: accounts = [] }   = useAccounts()
  const { data: categories = [] } = useFinanceCategories()

  const [type, setType]             = useState<'income' | 'expense'>('expense')
  const [amount, setAmount]         = useState('')
  const [description, setDesc]      = useState('')
  const [date, setDate]             = useState(format(new Date(), 'yyyy-MM-dd'))
  const [accountId, setAccountId]   = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    if (editing) {
      setType(editing.type)
      setAmount(editing.amount.toString())
      setDesc(editing.description ?? '')
      setDate(editing.date)
      setAccountId(editing.account_id)
      setCategoryId(editing.category_id ?? '')
    } else {
      setType('expense'); setAmount(''); setDesc('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setAccountId(accounts[0]?.id ?? '')
      setCategoryId('')
    }
  }, [editing, open, accounts])

  async function handleSubmit() {
    if (!amount || !accountId) return
    const payload = {
      type, amount: parseFloat(amount.replace(',', '.')),
      description: description.trim() || null,
      date, account_id: accountId,
      category_id: categoryId || null,
      recurring_id: null, confirmed: true,
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar transação' : 'Nova transação'}>
      <div className="flex gap-2 mb-4">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
              type === t
                ? t === 'expense' ? 'bg-[#2d1515] text-[#f09595]' : 'bg-[#0d3330] text-[#1d9e75]'
                : 'bg-[#13131f] text-[#6b6b80]'
            }`}>
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>
      <FormField label="Valor (R$)">
        <input className={inputClass} placeholder="0,00" inputMode="decimal"
          value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Descrição">
        <input className={inputClass} placeholder="Ex: Supermercado"
          value={description} onChange={e => setDesc(e.target.value)} />
      </FormField>
      <FormField label="Conta">
        <select className={selectClass} value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">Selecione uma conta</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </FormField>
      <FormField label="Categoria">
        <select className={selectClass} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Sem categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <FormField label="Data">
        <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
      </FormField>
      <button onClick={handleSubmit} disabled={!amount || !accountId || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar transação'}
      </button>
    </BottomSheet>
  )
}
