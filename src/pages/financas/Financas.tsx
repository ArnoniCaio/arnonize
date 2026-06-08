import { useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAccounts, useTransactions, useRecurringTransactions, useFinanceCategories, useDeleteRecurring, useCreateTransaction, calcAccountBalance, useDeleteAccount } from '@/hooks/useFinancas'
import { AccountCard } from '@/components/financas/AccountCard'
import { TransactionRow } from '@/components/financas/TransactionRow'
import { SummaryChart } from '@/components/financas/SummaryChart'
import { TransactionForm } from '@/components/financas/TransactionForm'
import { AccountForm } from '@/components/financas/AccountForm'
import { RecurringForm } from '@/components/financas/RecurringForm'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { Account, Transaction, RecurringTransaction } from '@/types/financas'
import { format as fmtDate } from 'date-fns'

type FormType = 'transaction' | 'account' | 'recurring' | null
type Section  = 'transactions' | 'recurring'

const CREATE_OPTIONS = [
  { type: 'transaction' as FormType, icon: 'ti-arrows-exchange', label: 'Transação',  desc: 'Entrada ou saída avulsa' },
  { type: 'account'     as FormType, icon: 'ti-building-bank',   label: 'Conta',      desc: 'Nova conta ou carteira' },
  { type: 'recurring'   as FormType, icon: 'ti-repeat',          label: 'Fixo',       desc: 'Ganho ou gasto recorrente' },
]

export function Financas() {
  const [currentMonth, setCurrentMonth]             = useState(new Date())
  const [activeSection, setActiveSection]           = useState<Section>('transactions')
  const [pickerOpen, setPickerOpen]                 = useState(false)
  const [activeForm, setActiveForm]                 = useState<FormType>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingAccount, setEditingAccount]         = useState<Account | null>(null)
  const [editingRecurring, setEditingRecurring]     = useState<RecurringTransaction | null>(null)
  const [detailTransaction, setDetailTransaction]   = useState<Transaction | null>(null)
  const [detailAccount, setDetailAccount]           = useState<Account | null>(null)

  const { data: accounts = [] }     = useAccounts()
  const { data: transactions = [] } = useTransactions(currentMonth)
  const { data: recurring = [] }    = useRecurringTransactions()
  const { data: categories = [] }   = useFinanceCategories()
  const deleteRecurring             = useDeleteRecurring()
  const deleteAccount               = useDeleteAccount()
  const createTransaction           = useCreateTransaction()

  function openForm(type: FormType) {
    setPickerOpen(false)
    setTimeout(() => setActiveForm(type), 150)
  }

  function closeForm() {
    setActiveForm(null)
    setEditingTransaction(null)
    setEditingAccount(null)
    setEditingRecurring(null)
  }

  async function confirmRecurring(r: RecurringTransaction) {
    const date = fmtDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.min(r.day_of_month, 28)),
      'yyyy-MM-dd'
    )
    await createTransaction.mutateAsync({
      account_id: r.account_id, category_id: r.category_id,
      type: r.type, amount: r.amount, description: r.description,
      date, recurring_id: r.id, confirmed: true,
    })
  }

  const confirmedIds = new Set(transactions.filter(t => t.recurring_id).map(t => t.recurring_id))

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Header */}
      <div className="pt-12 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#e2e2f0] tracking-tight">Finanças</h1>
        <button onClick={() => setPickerOpen(true)}
          className="w-9 h-9 bg-[#6366f1] rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <i className="ti ti-plus text-white" style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Navegação de mês */}
      <div className="px-4 flex items-center gap-3 mb-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70">
          <i className="ti ti-chevron-left text-[#6b6b80]" style={{ fontSize: 14 }} />
        </button>
        <p className="flex-1 text-center text-[14px] font-semibold text-[#e2e2f0] capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70">
          <i className="ti ti-chevron-right text-[#6b6b80]" style={{ fontSize: 14 }} />
        </button>
      </div>

      <div className="px-4 pb-6">
        {/* Cards de contas */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {accounts.length === 0 ? (
            <div className="w-full bg-[#13131f] rounded-2xl p-4 border border-[#1e1e32] flex items-center gap-3">
              <i className="ti ti-building-bank text-[#3a3a50]" style={{ fontSize: 24 }} />
              <p className="text-[13px] text-[#3a3a50]">Nenhuma conta cadastrada</p>
            </div>
          ) : (
            accounts.map(account => (
              <div key={account.id} className="flex-shrink-0" style={{ width: 'calc(80vw)', maxWidth: 280 }}>
                <AccountCard
                  account={account} transactions={transactions}
                  onTap={a => setDetailAccount(a)}
                />
              </div>
            ))
          )}
        </div>

        {/* Gráfico resumo */}
        {transactions.length > 0 && (
          <SummaryChart transactions={transactions} categories={categories} />
        )}

        {/* Abas de seção */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'transactions', label: 'Transações' },
            { key: 'recurring',    label: 'Fixos' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                activeSection === key ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#6b6b80]'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Lista de transações */}
        {activeSection === 'transactions' && (
          <div>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <i className="ti ti-receipt-off text-[#3a3a50]" style={{ fontSize: 32 }} />
                <p className="text-[#3a3a50] text-sm">Nenhuma transação este mês</p>
              </div>
            ) : (
              transactions.map(t => (
                <TransactionRow key={t.id} transaction={t} categories={categories}
                  onEdit={tx => { setEditingTransaction(tx); setTimeout(() => setActiveForm('transaction'), 50) }}
                  onTap={tx => setDetailTransaction(tx)}
                />
              ))
            )}
          </div>
        )}

        {/* Lista de fixos */}
        {activeSection === 'recurring' && (
          <div>
            {recurring.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <i className="ti ti-repeat-off text-[#3a3a50]" style={{ fontSize: 32 }} />
                <p className="text-[#3a3a50] text-sm">Nenhum fixo cadastrado</p>
              </div>
            ) : (
              recurring.map(r => {
                const confirmed = confirmedIds.has(r.id)
                const category = categories.find(c => c.id === r.category_id)
                return (
                  <SwipeableRow key={r.id}
                    actions={[
                      { icon: 'ti-pencil', color: '#6366f1', bg: '#2d2b5e', onPress: () => { setEditingRecurring(r); setTimeout(() => setActiveForm('recurring'), 50) } },
                      { icon: 'ti-trash',  color: '#f09595', bg: '#2d1515', onPress: () => deleteRecurring.mutate(r.id) },
                    ]}
                  >
                    <div className="flex items-center gap-3 py-3 border-b border-[#13131f] bg-[#0a0a0f]">
                      <div className="w-9 h-9 rounded-xl bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                        <i className={`ti ${r.type === 'income' ? 'ti-arrow-down-left' : 'ti-arrow-up-right'}`}
                          style={{ fontSize: 16, color: r.type === 'income' ? '#1d9e75' : '#f09595' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#e2e2f0] truncate">{r.description}</p>
                        <p className="text-[11px] text-[#6b6b80] mt-0.5">
                          {category?.name ?? 'Sem categoria'} · dia {r.day_of_month}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className={`text-[13px] font-semibold ${r.type === 'income' ? 'text-[#1d9e75]' : 'text-[#f09595]'}`}>
                          {r.type === 'income' ? '+' : '-'}R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {!confirmed ? (
                          <button onClick={() => confirmRecurring(r)}
                            className="text-[10px] bg-[#2d2b5e] text-[#6366f1] px-2 py-0.5 rounded-md font-semibold active:opacity-70">
                            Confirmar
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#1d9e75] font-semibold">✓ confirmado</span>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Picker de criação */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="O que deseja adicionar?">
        <div className="flex flex-col gap-2">
          {CREATE_OPTIONS.map(({ type, icon, label, desc }) => (
            <button key={type} onClick={() => openForm(type)}
              className="flex items-center gap-4 p-4 bg-[#13131f] rounded-2xl border border-[#1e1e32] active:bg-[#1a1a2e] transition-colors text-left w-full">
              <div className="w-10 h-10 rounded-xl bg-[#2d2b5e] flex items-center justify-center flex-shrink-0">
                <i className={`ti ${icon} text-[#6366f1]`} style={{ fontSize: 20 }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#e2e2f0]">{label}</p>
                <p className="text-[12px] text-[#6b6b80] mt-0.5">{desc}</p>
              </div>
              <i className="ti ti-chevron-right text-[#3a3a50] ml-auto" style={{ fontSize: 16 }} />
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Formulários */}
      <TransactionForm open={activeForm === 'transaction'} onClose={closeForm} editing={editingTransaction} />
      <AccountForm     open={activeForm === 'account'}     onClose={closeForm} editing={editingAccount} />
      <RecurringForm   open={activeForm === 'recurring'}   onClose={closeForm} editing={editingRecurring} />

      {/* Detalhe de conta */}
      <BottomSheet open={!!detailAccount} onClose={() => setDetailAccount(null)} title="Conta">
        {detailAccount && (() => {
          const balance = calcAccountBalance(detailAccount, transactions)
          const isPositive = balance >= 0
          const ACCOUNT_LABELS: Record<string, string> = {
            checking: 'Conta corrente', savings: 'Poupança',
            wallet: 'Carteira', investment: 'Investimentos', other: 'Outro',
          }
          return (
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <p className="text-[15px] text-[#6b6b80]">{ACCOUNT_LABELS[detailAccount.type]}</p>
                <p className={`text-[32px] font-bold tracking-tight mt-1 ${isPositive ? 'text-[#e2e2f0]' : 'text-[#f09595]'}`}>
                  {isPositive ? '' : '-'}R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[13px] text-[#6b6b80] mt-1">
                  Saldo inicial: R$ {detailAccount.initial_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setDetailAccount(null)
                    setTimeout(() => { setEditingAccount(detailAccount); setActiveForm('account') }, 150)
                  }}
                  className="w-full bg-[#1a1a2e] border border-[#6366f1] text-[#6366f1] rounded-xl py-3 text-[14px] font-semibold active:opacity-70"
                >
                  <i className="ti ti-pencil mr-2" style={{ fontSize: 14 }} />
                  Editar conta
                </button>
                <button
                  onClick={() => { deleteAccount.mutate(detailAccount.id); setDetailAccount(null) }}
                  className="w-full bg-[#2d1515] border border-[#f09595] text-[#f09595] rounded-xl py-3 text-[14px] font-semibold active:opacity-70"
                >
                  <i className="ti ti-trash mr-2" style={{ fontSize: 14 }} />
                  Excluir conta
                </button>
              </div>
            </div>
          )
        })()}
      </BottomSheet>

      {/* Detalhe de transação */}
      <BottomSheet open={!!detailTransaction} onClose={() => setDetailTransaction(null)} title="Transação">
        {detailTransaction && (() => {
          const cat = categories.find(c => c.id === detailTransaction.category_id)
          const isIncome = detailTransaction.type === 'income'
          return (
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <p className={`text-[28px] font-bold ${isIncome ? 'text-[#1d9e75]' : 'text-[#f09595]'}`}>
                  {isIncome ? '+' : '-'}R$ {detailTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[15px] text-[#e2e2f0] mt-1">
                  {detailTransaction.description ?? (isIncome ? 'Receita' : 'Despesa')}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
                  <i className="ti ti-calendar text-[#6366f1]" style={{ fontSize: 18 }} />
                  <p className="text-[14px] text-[#a5a5c0]">
                    {format(new Date(detailTransaction.date + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: ptBR })}
                  </p>
                </div>
                {cat && (
                  <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color ?? '#6366f1' }} />
                    <p className="text-[14px] text-[#a5a5c0]">{cat.name}</p>
                  </div>
                )}
                {detailTransaction.recurring_id && (
                  <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
                    <i className="ti ti-repeat text-[#6366f1]" style={{ fontSize: 18 }} />
                    <p className="text-[14px] text-[#a5a5c0]">Transação recorrente</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setDetailTransaction(null)
                  setTimeout(() => { setEditingTransaction(detailTransaction); setActiveForm('transaction') }, 150)
                }}
                className="w-full bg-[#1a1a2e] border border-[#6366f1] text-[#6366f1] rounded-xl py-3 text-[14px] font-semibold active:opacity-70"
              >
                <i className="ti ti-pencil mr-2" style={{ fontSize: 14 }} />
                Editar transação
              </button>
            </div>
          )
        })()}
      </BottomSheet>
    </div>
  )
}
