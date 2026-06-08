import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white w-full overflow-x-hidden">
      <main className="w-full overflow-x-hidden" style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
