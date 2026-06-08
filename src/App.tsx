import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Agenda } from './pages/agenda/Agenda'
import { Financas } from './pages/financas/Financas'
import { Saude } from './pages/saude/Saude'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[#e2e2f0]">{title}</h1>
      <p className="text-[#6b6b80] text-sm mt-1">Em breve</p>
    </div>
  )
}

export default function App() {
  return (
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
      </Route>
    </Routes>
  )
}
