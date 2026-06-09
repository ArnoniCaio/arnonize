import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Agenda } from './pages/agenda/Agenda'
import { Financas } from './pages/financas/Financas'
import { Saude } from './pages/saude/Saude'
import { Login } from './pages/auth/Login'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './context/ThemeContext'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[#e2e2f0]">{title}</h1>
      <p className="text-[#6b6b80] text-sm mt-1">Em breve</p>
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6366f1] flex items-center justify-center">
            <i className="ti ti-leaf text-white" style={{ fontSize: 20 }} />
          </div>
          <p className="text-[#3a3a50] text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="financas" element={<Financas />} />
          <Route path="saude" element={<Saude />} />
          <Route path="metas" element={<Placeholder title="Metas & OKRs" />} />
          <Route path="cultura" element={<Placeholder title="Cultura & Entretenimento" />} />
          <Route path="hobbies" element={<Placeholder title="Hobbies" />} />
          <Route path="aprendizado" element={<Placeholder title="Aprendizado" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
