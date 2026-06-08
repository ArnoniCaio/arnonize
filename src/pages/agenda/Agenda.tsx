import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayStrip } from '@/components/agenda/DayStrip'
import { EventCard } from '@/components/agenda/EventCard'
import { TaskRow } from '@/components/agenda/TaskRow'
import { HabitRow } from '@/components/agenda/HabitRow'
import { EventForm } from '@/components/agenda/EventForm'
import { TaskForm } from '@/components/agenda/TaskForm'
import { HabitForm } from '@/components/agenda/HabitForm'
import { useEvents, useTasks, useHabits, useHabitLogs } from '@/hooks/useAgenda'

type FormType = 'event' | 'task' | 'habit' | null

export function Agenda() {
  const [selected, setSelected] = useState(new Date())
  const [fabOpen, setFabOpen] = useState(false)
  const [activeForm, setActiveForm] = useState<FormType>(null)

  const { data: events = [] }    = useEvents(selected)
  const { data: tasks = [] }     = useTasks(selected)
  const { data: habits = [] }    = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(selected)

  const dateLabel = format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })

  function openForm(type: FormType) {
    setFabOpen(false)
    setActiveForm(type)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="pt-12 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#e2e2f0] tracking-tight">Agenda</h1>
        <button
          onClick={() => setFabOpen(v => !v)}
          className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center"
        >
          <i className={`ti ${fabOpen ? 'ti-x' : 'ti-plus'} text-white`} style={{ fontSize: 16 }} />
        </button>
      </div>

      {fabOpen && (
        <div className="absolute right-4 top-20 z-30 bg-[#13131f] border border-[#1e1e32] rounded-2xl overflow-hidden shadow-xl">
          {[
            { type: 'event' as FormType, icon: 'ti-calendar-plus', label: 'Novo evento' },
            { type: 'task'  as FormType, icon: 'ti-circle-plus',   label: 'Nova tarefa' },
            { type: 'habit' as FormType, icon: 'ti-repeat',        label: 'Novo hábito' },
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => openForm(type)}
              className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[#1a1a2e] transition-colors border-b border-[#1e1e32] last:border-0"
            >
              <i className={`ti ${icon} text-[#6366f1]`} style={{ fontSize: 18 }} />
              <span className="text-[14px] text-[#e2e2f0]">{label}</span>
            </button>
          ))}
        </div>
      )}

      <DayStrip selected={selected} onSelect={setSelected} />

      <div className="px-4 mb-2">
        <p className="text-[12px] text-[#6b6b80] capitalize">{dateLabel}</p>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-6">
        {events.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">Eventos</p>
            <div className="flex flex-col gap-2">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}
        {tasks.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">Tarefas</p>
            {tasks.map(t => <TaskRow key={t.id} task={t} />)}
          </section>
        )}
        {habits.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">Hábitos</p>
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

      <EventForm open={activeForm === 'event'} onClose={() => setActiveForm(null)} defaultDate={selected} />
      <TaskForm  open={activeForm === 'task'}  onClose={() => setActiveForm(null)} defaultDate={selected} />
      <HabitForm open={activeForm === 'habit'} onClose={() => setActiveForm(null)} />
    </div>
  )
}
