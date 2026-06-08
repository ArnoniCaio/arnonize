import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const mainNav = [
  { label: 'Início',   path: '/',         icon: 'ti-layout-dashboard' },
  { label: 'Agenda',   path: '/agenda',   icon: 'ti-calendar' },
  { label: 'Finanças', path: '/financas', icon: 'ti-wallet' },
  { label: 'Saúde',    path: '/saude',    icon: 'ti-heart-rate-monitor' },
]

const moreNav = [
  { label: 'Metas',       path: '/metas',       icon: 'ti-target' },
  { label: 'Cultura',     path: '/cultura',     icon: 'ti-book' },
  { label: 'Hobbies',     path: '/hobbies',     icon: 'ti-puzzle' },
  { label: 'Aprendizado', path: '/aprendizado', icon: 'ti-school' },
]

export function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {drawerOpen && (
        <div className="fixed bottom-[72px] left-0 right-0 z-50 bg-[#0d0d14] border-t border-[#1e1e2e] rounded-t-2xl p-4">
          <div className="w-10 h-1 bg-[#1e1e32] rounded-full mx-auto mb-4" />
          <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-3 px-1">
            Mais módulos
          </p>
          <div className="grid grid-cols-4 gap-2">
            {moreNav.map(({ label, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-colors ${
                    isActive
                      ? 'bg-[#2d2b5e] text-[#6366f1]'
                      : 'bg-[#13131f] text-[#6b6b80]'
                  }`
                }
              >
                <i className={`ti ${icon} text-xl`} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-[#0d0d14] border-t border-[#1e1e2e] flex items-center justify-around px-2 pb-3">
        {mainNav.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 ${
                isActive ? 'text-[#6366f1]' : 'text-[#3a3a50]'
              }`
            }
          >
            <i className={`ti ${icon} text-[20px]`} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          className={`flex flex-col items-center gap-1 px-4 py-1 ${
            drawerOpen ? 'text-[#6366f1]' : 'text-[#3a3a50]'
          }`}
        >
          <i className="ti ti-dots text-[20px]" />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </nav>
    </>
  )
}
