import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FormField, inputClass, selectClass } from '@/components/ui/FormField'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useFinancas'
import { Account } from '@/types/financas'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Account | null
}

export function AccountForm({ open, onClose, editing }: Props) {
  const create = useCreateAccount()
  const update = useUpdateAccount()

  const [name, setName]       = useState('')
  const [type, setType]       = useState<Account['type']>('checking')
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (editing) {
      setName(editing.name); setType(editing.type)
      setBalance(editing.initial_balance.toString())
    } else {
      setName(''); setType('checking'); setBalance('')
    }
  }, [editing, open])

  async function handleSubmit() {
    if (!name.trim()) return
    const payload = {
      name: name.trim(), type,
      initial_balance: parseFloat(balance.replace(',', '.')) || 0,
      active: true,
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar conta' : 'Nova conta'}>
      <FormField label="Nome da conta">
        <input className={inputClass} placeholder="Ex: Nubank, Carteira"
          value={name} onChange={e => setName(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Tipo">
        <select className={selectClass} value={type} onChange={e => setType(e.target.value as Account['type'])}>
          <option value="checking">Conta corrente</option>
          <option value="savings">Poupança</option>
          <option value="wallet">Carteira</option>
          <option value="investment">Investimentos</option>
          <option value="other">Outro</option>
        </select>
      </FormField>
      <FormField label="Saldo inicial (R$)">
        <input className={inputClass} placeholder="0,00" inputMode="decimal"
          value={balance} onChange={e => setBalance(e.target.value)} />
      </FormField>
      <button onClick={handleSubmit} disabled={!name.trim() || isPending}
        className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-semibold mt-2 disabled:opacity-40">
        {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar conta'}
      </button>
    </BottomSheet>
  )
}
