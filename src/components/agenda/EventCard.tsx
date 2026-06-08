import { Event } from '@/types/agenda'

interface Props { event: Event }

export function EventCard({ event }: Props) {
  const timeStr = event.start_time ? event.start_time.slice(0, 5) : ''
  const dur = event.duration_minutes
    ? event.duration_minutes >= 60
      ? `${Math.floor(event.duration_minutes / 60)}h${event.duration_minutes % 60 > 0 ? event.duration_minutes % 60 + 'min' : ''}`
      : `${event.duration_minutes}min`
    : ''

  return (
    <div className="flex items-center gap-3 bg-[#13131f] rounded-2xl p-3 border border-[#1e1e32]">
      <div className="w-[3px] self-stretch rounded-full bg-[#6366f1] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#e2e2f0] truncate">{event.title}</p>
        {event.description && (
          <p className="text-[12px] text-[#6b6b80] mt-0.5 truncate">{event.description}</p>
        )}
      </div>
      {timeStr && (
        <div className="bg-[#1a1a2e] rounded-lg px-2 py-1 flex-shrink-0">
          <p className="text-[11px] font-medium text-[#a5a5c0]">{timeStr}</p>
          {dur && <p className="text-[10px] text-[#6b6b80] text-center">{dur}</p>}
        </div>
      )}
    </div>
  )
}
