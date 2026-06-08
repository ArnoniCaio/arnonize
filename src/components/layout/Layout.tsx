import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="ml-60 p-8">
        <Outlet />
      </main>
    </div>
  )
}
