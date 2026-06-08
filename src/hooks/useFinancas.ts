import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Account, Transaction, RecurringTransaction, Category, FinancialGoal } from '@/types/financas'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts').select('*').eq('active', true).order('created_at')
      if (error) throw error
      return data as Account[]
    }
  })
}

export function useTransactions(month: Date) {
  const start = format(startOfMonth(month), 'yyyy-MM-dd')
  const end   = format(endOfMonth(month),   'yyyy-MM-dd')
  return useQuery({
    queryKey: ['transactions', start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions').select('*')
        .gte('date', start).lte('date', end)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Transaction[]
    }
  })
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurring_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions').select('*')
        .eq('active', true).order('day_of_month')
      if (error) throw error
      return data as RecurringTransaction[]
    }
  })
}

export function useFinanceCategories() {
  return useQuery({
    queryKey: ['categories', 'finance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories').select('*').eq('module', 'finance').order('name')
      if (error) throw error
      return data as Category[]
    }
  })
}

export function useFinancialGoals() {
  return useQuery({
    queryKey: ['financial_goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals').select('*').order('created_at')
      if (error) throw error
      return data as FinancialGoal[]
    }
  })
}

// Mutations — Contas
export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Account, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('accounts').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] })
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Account> & { id: string }) => {
      const { error } = await supabase.from('accounts').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] })
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] })
  })
}

// Mutations — Transações
export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('transactions').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] })
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { error } = await supabase.from('transactions').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] })
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] })
  })
}

// Mutations — Recorrentes
export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<RecurringTransaction, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('recurring_transactions').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring_transactions'] })
  })
}

export function useUpdateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RecurringTransaction> & { id: string }) => {
      const { error } = await supabase.from('recurring_transactions').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring_transactions'] })
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring_transactions'] })
  })
}

// Mutations — Metas
export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<FinancialGoal, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('financial_goals').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial_goals'] })
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancialGoal> & { id: string }) => {
      const { error } = await supabase.from('financial_goals').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial_goals'] })
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial_goals'] })
  })
}

export function calcAccountBalance(account: Account, transactions: Transaction[]): number {
  const accountTxs = transactions.filter(t => t.account_id === account.id)
  return accountTxs.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount
  }, account.initial_balance)
}
