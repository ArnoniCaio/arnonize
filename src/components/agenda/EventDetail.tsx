import { Event } from '@/types/agenda'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  event: Event | null
  onClose: () => void
  onEdit: (event: Event) => void
}

export function EventDetail({ event, onClose, onEdit }: Props) {
  if (!event) return null

  const timeStr = event.start_time ? event.start_time.slice(0, 5) : null
  const dur = event.duration_minutes
    ? event.duration_minutes >= 60
      ? `${Math.floor(event.duration_minutes / 60)}h${event.duration_minutes % 60 > 0 ? event.duration_minutes % 60 + 'min' : ''}`
      : `${event.duration_minutes}min`
    : null
  const dateStr = format(new Date(event.event_date + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <BottomSheet open={!!event} onClose={onClose} title="Evento">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <p className="text-[20px] font-semibold text-[#e2e2f0] leading-snug">{event.title}</p>
          {event.description && (
            <p className="text-[14px] text-[#6b6b80] mt-1">{event.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
            <i className="ti ti-calendar text-[#6366f1]" style={{ fontSize: 18 }} />
            <p className="text-[14px] text-[#a5a5c0] capitalize">{dateStr}</p>
          </div>
          {timeStr && (
            <div className="flex items-center gap-3 p-3 bg-[#13131f] rounded-xl border border-[#1e1e32]">
              <i className="ti ti-clock text-[#6366f1]" style={{ fontSize: 18 }} />
              <p className="text-[14px] text-[#a5a5c0]">{timeStr}{dur ? ` · ${dur}` : ''}</p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => { onClose(); setTimeout(() => onEdit(event), 150) }}
        className="w-full bg-[#1a1a2e] border border-[#6366f1] text-[#6366f1] rounded-xl py-3 text-[14px] font-semibold transition-opacity active:opacity-70"
      >
        <i className="ti ti-pencil mr-2" style={{ fontSize: 14 }} />
        Editar evento
      </button>
    </BottomSheet>
  )
}
