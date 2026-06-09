export interface Account {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings' | 'wallet' | 'investment' | 'other'
  initial_balance: number
  active: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  module: 'finance' | 'tasks'
  color: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: 'income' | 'expense'
  amount: number
  description: string | null
  date: string
  recurring_id: string | null
  confirmed: boolean
  created_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: 'income' | 'expense'
  amount: number
  description: string
  day_of_month: number
  recurrence: 'monthly' | 'weekly'
  active: boolean
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: number
  year: number
  created_at: string
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  deadline: string | null
  achieved: boolean
  created_at: string
}
