import { Event } from '@/types/agenda'
import { useDeleteEvent } from '@/hooks/useAgenda'
import { SwipeableRow } from '@/components/ui/SwipeableRow'

interface Props {
  event: Event
  onEdit: (event: Event) => void
  onTap: (event: Event) => void
}

export function EventCard({ event, onEdit, onTap }: Props) {
  const deleteEvent = useDeleteEvent()

  const timeStr = event.start_time ? event.start_time.slice(0, 5) : ''
  const dur = event.duration_minutes
    ? event.duration_minutes >= 60
      ? `${Math.floor(event.duration_minutes / 60)}h${event.duration_minutes % 60 > 0 ? event.duration_minutes % 60 + 'min' : ''}`
      : `${event.duration_minutes}min`
    : ''

  return (
    <SwipeableRow
      actions={[
        { icon: 'ti-pencil', color: '#6366f1', bg: '#2d2b5e', onPress: () => onEdit(event) },
        { icon: 'ti-trash',  color: '#f09595', bg: '#2d1515', onPress: () => deleteEvent.mutate(event.id) },
      ]}
    >
      <div
        onClick={() => onTap(event)}
        className="flex items-center gap-3 bg-[#13131f] rounded-2xl p-3 border border-[#1e1e32] active:opacity-80 transition-opacity"
        style={{ isolation: 'isolate' }}
      >
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
    </SwipeableRow>
  )
}
