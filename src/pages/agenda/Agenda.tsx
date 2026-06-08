import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayStrip } from '@/components/agenda/DayStrip'
import { EventCard } from '@/components/agenda/EventCard'
import { TaskRow } from '@/components/agenda/TaskRow'
import { HabitRow } from '@/components/agenda/HabitRow'
import { useEvents, useTasks, useHabits, useHabitLogs } from '@/hooks/useAgenda'

export function Agenda() {
  const [selected, setSelected] = useState(new Date())

  const { data: events = [] }    = useEvents(selected)
  const { data: tasks = [] }     = useTasks(selected)
  const { data: habits = [] }    = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(selected)

  const dateLabel = format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="pt-12 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#e2e2f0] tracking-tight">Agenda</h1>
        <button className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center">
          <i className="ti ti-plus text-white" style={{ fontSize: 16 }} />
        </button>
      </div>

      <DayStrip selected={selected} onSelect={setSelected} />

      <div className="px-4 mb-2">
        <p className="text-[12px] text-[#6b6b80] capitalize">{dateLabel}</p>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-6">
        {events.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">
              Eventos
            </p>
            <div className="flex flex-col gap-2">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {tasks.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">
              Tarefas
            </p>
            {tasks.map(t => <TaskRow key={t.id} task={t} />)}
          </section>
        )}

        {habits.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">
              Hábitos
            </p>
            {habits.map(h => (
              <HabitRow
                key={h.id}
                habit={h}
                log={habitLogs.find(l => l.habit_id === h.id)}
                date={selected}
              />
            ))}
          </section>
        )}

        {events.length === 0 && tasks.length === 0 && habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <i className="ti ti-calendar-off text-[#3a3a50]" style={{ fontSize: 32 }} />
            <p className="text-[#3a3a50] text-sm">Nenhum item para este dia</p>
          </div>
        )}
      </div>
    </div>
  )
}
