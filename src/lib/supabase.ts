import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'arnonize-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.id) return session.user.id

  const { data: { session: refreshed }, error } = await supabase.auth.refreshSession()
  if (error || !refreshed?.user?.id) throw new Error('Não autenticado')
  return refreshed.user.id
}
