import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  HeartPulse,
  Sprout
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Agenda', path: '/agenda', icon: CalendarDays },
  { label: 'Finanças', path: '/financas', icon: Wallet },
  { label: 'Saúde', path: '/saude', icon: HeartPulse },
]

export function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-zinc-800">
        <span className="text-white font-semibold text-lg tracking-tight flex items-center gap-2">
          <Sprout size={20} className="text-emerald-400" />
          Arnonize
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-zinc-800">
        <span className="text-zinc-600 text-xs">v0.1.0 — MVP</span>
      </div>
    </aside>
  )
}
