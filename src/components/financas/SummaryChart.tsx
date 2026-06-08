import { useState } from 'react'
import { Transaction, Category } from '@/types/financas'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface Props {
  transactions: Transaction[]
  categories: Category[]
}

export function SummaryChart({ transactions, categories }: Props) {
  const [tab, setTab] = useState<'overview' | 'categories'>('overview')

  const income   = transactions.filter(t => t.type === 'income' && t.confirmed).reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense' && t.confirmed).reduce((s, t) => s + t.amount, 0)
  const balance  = income - expenses

  const categoryData = categories
    .map(cat => {
      const total = transactions
        .filter(t => t.category_id === cat.id && t.type === 'expense' && t.confirmed)
        .reduce((s, t) => s + t.amount, 0)
      return { name: cat.name, value: total, color: cat.color ?? '#6366f1' }
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const overviewData = [
    { name: 'Receitas', value: income,   color: '#1d9e75' },
    { name: 'Despesas', value: expenses, color: '#f09595' },
  ]

  return (
    <div className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-4 mb-4">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-[#6b6b80] uppercase tracking-widest">Receitas</p>
          <p className="text-[14px] font-bold text-[#1d9e75]">
            R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <p className="text-[10px] text-[#6b6b80] uppercase tracking-widest">Saldo</p>
          <p className={`text-[14px] font-bold ${balance >= 0 ? 'text-[#e2e2f0]' : 'text-[#f09595]'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <p className="text-[10px] text-[#6b6b80] uppercase tracking-widest">Despesas</p>
          <p className="text-[14px] font-bold text-[#f09595]">
            R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'overview',   label: 'Visão geral' },
          { key: 'categories', label: 'Por categoria' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'overview' | 'categories')}
            className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              tab === key ? 'bg-[#6366f1] text-white' : 'bg-[#1a1a2e] text-[#6b6b80]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={overviewData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                dataKey="value" paddingAngle={3}>
                {overviewData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 flex-1">
            {overviewData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <p className="text-[12px] text-[#6b6b80] flex-1">{d.name}</p>
                <p className="text-[12px] font-semibold text-[#e2e2f0]">
                  R$ {d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'categories' && (
        categoryData.length > 0 ? (
          <div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80}
                  tick={{ fontSize: 11, fill: '#6b6b80' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{ background: '#13131f', border: '1px solid #1e1e32', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e2f0' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center py-6">
            <p className="text-[#3a3a50] text-[13px]">Nenhuma despesa por categoria este mês</p>
          </div>
        )
      )}
    </div>
  )
}
