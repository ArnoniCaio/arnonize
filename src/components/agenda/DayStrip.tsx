import { useRef, useEffect, useState } from 'react'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

interface Props {
  selected: Date
  onSelect: (d: Date) => void
}

function useDaysWithItems(month: Date) {
  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(month),   'yyyy-MM-dd')
  return useQuery({
    queryKey: ['days-with-items', monthStart],
    queryFn: async () => {
      const [eventsRes, tasksRes] = await Promise.all([
        supabase.from('events').select('event_date').gte('event_date', monthStart).lte('event_date', monthEnd),
        supabase.from('tasks').select('due_date').gte('due_date', monthStart).lte('due_date', monthEnd),
      ])
      const dates = new Set<string>()
      eventsRes.data?.forEach(e => dates.add(e.event_date))
      tasksRes.data?.forEach(t => { if (t.due_date) dates.add(t.due_date) })
      return dates
    }
  })
}

export function DayStrip({ selected, onSelect }: Props) {
  const today = new Date()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selected))

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const { data: daysWithItems = new Set() } = useDaysWithItems(currentMonth)

  useEffect(() => {
    if (!scrollRef.current) return
    const idx = days.findIndex(d => isSameDay(d, selected))
    if (idx < 0) return
    const itemWidth = 48
    const containerWidth = scrollRef.current.offsetWidth
    const scrollTo = idx * itemWidth - containerWidth / 2 + itemWidth / 2
    scrollRef.current.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' })
  }, [selected, currentMonth])

  useEffect(() => {
    const selectedMonth = startOfMonth(selected)
    if (selectedMonth.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(selectedMonth)
    }
  }, [selected])

  function goToToday() {
    onSelect(new Date())
    setCurrentMonth(startOfMonth(new Date()))
  }

  const monthStart = startOfMonth(currentMonth)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <>
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-7 h-7 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70"
            >
              <i className="ti ti-chevron-left text-[#6b6b80]" style={{ fontSize: 14 }} />
            </button>
            <button
              onClick={() => { setCurrentMonth(startOfMonth(selected)); setCalendarOpen(true) }}
              className="flex items-center gap-1 active:opacity-70"
            >
              <p className="text-[13px] font-semibold text-[#6366f1] capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </p>
              <i className="ti ti-chevron-down text-[#6366f1]" style={{ fontSize: 11 }} />
            </button>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="w-7 h-7 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70"
            >
              <i className="ti ti-chevron-right text-[#6b6b80]" style={{ fontSize: 14 }} />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="text-[11px] text-[#6b6b80] border border-[#1e1e32] rounded-lg px-2 py-1 active:opacity-70"
          >
            Hoje
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selected)
            const isToday    = isSameDay(day, today)
            const hasItems   = daysWithItems.has(format(day, 'yyyy-MM-dd'))
            return (
              <button
                key={i}
                onClick={() => onSelect(day)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-[#6366f1]' : isToday ? 'bg-[#13131f] ring-1 ring-[#6366f1]' : ''
                }`}
                style={{ width: 44 }}
              >
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#c7c8f8]' : 'text-[#6b6b80]'}`}>
                  {format(day, 'EEEEE', { locale: ptBR })}
                </span>
                <span className={`text-[16px] font-bold leading-none ${
                  isSelected ? 'text-white' : isToday ? 'text-[#6366f1]' : 'text-[#a5a5c0]'
                }`}>
                  {format(day, 'd')}
                </span>
                <span
                  className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: hasItems
                      ? isSelected ? '#c7c8f8' : '#6366f1'
                      : 'transparent'
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      <BottomSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} title="Calendário">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70"
          >
            <i className="ti ti-chevron-left text-[#a5a5c0]" style={{ fontSize: 16 }} />
          </button>
          <p className="text-[15px] font-semibold text-[#e2e2f0] capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70"
          >
            <i className="ti ti-chevron-right text-[#a5a5c0]" style={{ fontSize: 16 }} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#3a3a50] py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const isSelected = isSameDay(day, selected)
            const isToday    = isSameDay(day, today)
            const hasItems   = daysWithItems.has(format(day, 'yyyy-MM-dd'))
            return (
              <div key={day.toISOString()} className="flex flex-col items-center gap-0.5">
                <button
                  onClick={() => { onSelect(day); setCalendarOpen(false) }}
                  className={`flex items-center justify-center rounded-full transition-colors ${
                    isSelected ? 'bg-[#6366f1]' : isToday ? 'bg-[#13131f] ring-1 ring-[#6366f1]' : 'active:bg-[#13131f]'
                  }`}
                  style={{ width: 36, height: 36 }}
                >
                  <span className={`text-[14px] font-medium ${
                    isSelected ? 'text-white' : isToday ? 'text-[#6366f1]' : 'text-[#a5a5c0]'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </button>
                <span
                  className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: hasItems
                      ? isSelected ? '#c7c8f8' : '#6366f1'
                      : 'transparent'
                  }}
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={() => { goToToday(); setCalendarOpen(false) }}
          className="w-full mt-4 py-3 bg-[#13131f] border border-[#1e1e32] rounded-xl text-[14px] text-[#6366f1] font-medium active:opacity-70"
        >
          Ir para hoje
        </button>
      </BottomSheet>
    </>
  )
}
