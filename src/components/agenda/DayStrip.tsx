import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  selected: Date
  onSelect: (d: Date) => void
}

export function DayStrip({ selected, onSelect }: Props) {
  const start = startOfWeek(selected, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="px-4 pb-3">
      <p className="text-[13px] font-semibold text-[#6366f1] mb-3">
        {format(selected, 'MMMM yyyy', { locale: ptBR })}
      </p>
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {days.map(day => {
          const isSelected = isSameDay(day, selected)
          const isToday = isSameDay(day, new Date())
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl flex-shrink-0 min-w-[44px] transition-colors ${
                isSelected ? 'bg-[#6366f1]' : isToday ? 'bg-[#13131f] ring-1 ring-[#6366f1]' : 'bg-transparent'
              }`}
            >
              <span className={`text-[10px] font-medium uppercase tracking-wide ${isSelected ? 'text-[#c7c8f8]' : 'text-[#6b6b80]'}`}>
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className={`text-[17px] font-bold leading-none ${isSelected ? 'text-white' : isToday ? 'text-[#6366f1]' : 'text-[#a5a5c0]'}`}>
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
