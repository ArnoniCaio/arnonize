import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Agenda } from './pages/agenda/Agenda'
import { Financas } from './pages/financas/Financas'
import { Saude } from './pages/saude/Saude'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="financas" element={<Financas />} />
        <Route path="saude" element={<Saude />} />
      </Route>
    </Routes>
  )
}
