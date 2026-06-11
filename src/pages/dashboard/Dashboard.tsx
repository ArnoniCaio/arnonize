import { APP_VERSION } from '@/version'

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm">Visão geral de todas as áreas</p>

      <div className="m-4 p-3 rounded-xl bg-[#13131f] border border-[#1e1e32] text-[10px] text-[#6b6b80] break-all">
        <p className="text-[#6366f1]">v{APP_VERSION}</p>
        <p>SW: {String('serviceWorker' in navigator)}</p>
        <p>Push: {String('PushManager' in window)}</p>
        <p>Notification: {typeof Notification !== 'undefined' ? Notification.permission : 'indefinido'}</p>
      </div>
    </div>
  )
}
