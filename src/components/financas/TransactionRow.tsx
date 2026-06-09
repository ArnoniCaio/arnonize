import { Transaction, Category } from '@/types/financas'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { useDeleteTransaction } from '@/hooks/useFinancas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  transaction: Transaction
  categories: Category[]
  onEdit: (t: Transaction) => void
  onTap: (t: Transaction) => void
}

export function TransactionRow({ transaction, categories, onEdit, onTap }: Props) {
  const deleteTransaction = useDeleteTransaction()
  const category = categories.find(c => c.id === transaction.category_id)
  const isIncome = transaction.type === 'income'

  return (
    <SwipeableRow
      actions={[
        { icon: 'ti-pencil', color: 'var(--swipe-edit-color)',   bg: 'var(--swipe-edit-bg)',   onPress: () => onEdit(transaction) },
        { icon: 'ti-trash',  color: 'var(--swipe-delete-color)', bg: 'var(--swipe-delete-bg)', onPress: () => deleteTransaction.mutate(transaction.id) },
      ]}
    >
      <div
        onClick={() => onTap(transaction)}
        className={`flex items-center gap-3 py-3 border-b border-[#13131f] bg-[#0a0a0f] transition-opacity ${
          !transaction.confirmed ? 'opacity-50' : ''
        }`}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: category?.color ? `${category.color}22` : '#1a1a2e' }}
        >
          <i
            className={`ti ${isIncome ? 'ti-arrow-down-left' : 'ti-arrow-up-right'}`}
            style={{ fontSize: 16, color: isIncome ? '#1d9e75' : '#f09595' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#e2e2f0] truncate">
            {transaction.description || (isIncome ? 'Receita' : 'Despesa')}
          </p>
          <p className="text-[11px] text-[#6b6b80] mt-0.5">
            {category?.name ?? 'Sem categoria'} · {format(new Date(transaction.date + 'T12:00:00'), "d MMM", { locale: ptBR })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-[14px] font-semibold ${isIncome ? 'text-[#1d9e75]' : 'text-[#f09595]'}`}>
            {isIncome ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {!transaction.confirmed && (
            <p className="text-[10px] text-[#6b6b80]">pendente</p>
          )}
        </div>
      </div>
    </SwipeableRow>
  )
}
