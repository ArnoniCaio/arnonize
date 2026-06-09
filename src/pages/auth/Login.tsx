import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#6366f1] flex items-center justify-center mb-4">
            <i className="ti ti-leaf text-white" style={{ fontSize: 28 }} />
          </div>
          <h1 className="text-[24px] font-bold text-[#e2e2f0] tracking-tight">Arnonize</h1>
          <p className="text-[13px] text-[#6b6b80] mt-1">Life Operating System</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">Email</label>
            <input
              type="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
              placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#13131f] border border-[#1e1e32] rounded-xl px-3 h-[48px] text-[14px] text-[#e2e2f0] placeholder-[#3a3a50] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#13131f] border border-[#1e1e32] rounded-xl px-3 h-[48px] text-[14px] text-[#e2e2f0] placeholder-[#3a3a50] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[#f09595] bg-[#2d1515] px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={!email || !password || loading}
            className="w-full bg-[#6366f1] text-white rounded-xl h-[48px] text-[14px] font-semibold mt-2 disabled:opacity-40 active:opacity-90 transition-opacity"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
