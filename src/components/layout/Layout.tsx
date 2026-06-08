import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <main className="pb-[72px] min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
