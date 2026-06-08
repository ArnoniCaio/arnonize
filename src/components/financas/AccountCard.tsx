import { Account, Transaction } from '@/types/financas'
import { calcAccountBalance } from '@/hooks/useFinancas'

const ACCOUNT_ICONS: Record<string, string> = {
  checking:   'ti-building-bank',
  savings:    'ti-piggy-bank',
  wallet:     'ti-wallet',
  investment: 'ti-trending-up',
  other:      'ti-credit-card',
}

const ACCOUNT_LABELS: Record<string, string> = {
  checking:   'Conta corrente',
  savings:    'Poupança',
  wallet:     'Carteira',
  investment: 'Investimentos',
  other:      'Outro',
}

interface Props {
  account: Account
  transactions: Transaction[]
  onTap: (account: Account) => void
}

export function AccountCard({ account, transactions, onTap }: Props) {
  const balance = calcAccountBalance(account, transactions)
  const isPositive = balance >= 0

  return (
    <div
      onClick={() => onTap(account)}
      className="bg-[#13131f] rounded-2xl p-4 border border-[#1e1e32] active:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-[#2d2b5e] flex items-center justify-center">
          <i className={`ti ${ACCOUNT_ICONS[account.type]} text-[#6366f1]`} style={{ fontSize: 16 }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#e2e2f0]">{account.name}</p>
          <p className="text-[11px] text-[#6b6b80]">{ACCOUNT_LABELS[account.type]}</p>
        </div>
      </div>
      <p className={`text-[22px] font-bold tracking-tight ${isPositive ? 'text-[#e2e2f0]' : 'text-[#f09595]'}`}>
        {isPositive ? '' : '-'}R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
