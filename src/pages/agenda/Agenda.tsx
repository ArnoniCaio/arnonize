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
import { EventDetail } from '@/components/agenda/EventDetail'
import { TaskDetail } from '@/components/agenda/TaskDetail'
import { HabitDetail } from '@/components/agenda/HabitDetail'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useEvents, useTasks, useHabits, useHabitLogs } from '@/hooks/useAgenda'
import { Event, Task, Habit } from '@/types/agenda'

type FormType = 'event' | 'task' | 'habit' | null

const CREATE_OPTIONS = [
  { type: 'event' as FormType, icon: 'ti-calendar-plus', label: 'Evento',  desc: 'Compromisso com horário' },
  { type: 'task'  as FormType, icon: 'ti-circle-plus',   label: 'Tarefa',  desc: 'Item com prazo e prioridade' },
  { type: 'habit' as FormType, icon: 'ti-repeat',        label: 'Hábito',  desc: 'Rotina para acompanhar' },
]

export function Agenda() {
  const [selected, setSelected]         = useState(new Date())
  const [pickerOpen, setPickerOpen]     = useState(false)
  const [activeForm, setActiveForm]     = useState<FormType>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingTask, setEditingTask]   = useState<Task | null>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [detailEvent, setDetailEvent]   = useState<Event | null>(null)
  const [detailTask, setDetailTask]     = useState<Task | null>(null)
  const [detailHabit, setDetailHabit]   = useState<Habit | null>(null)

  const { data: events = [] }    = useEvents(selected)
  const { data: tasks = [] }     = useTasks(selected)
  const { data: habits = [] }    = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(selected)

  const dateLabel = format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })

  function openForm(type: FormType) {
    setPickerOpen(false)
    setTimeout(() => setActiveForm(type), 150)
  }

  function openEdit(type: FormType, item: Event | Task | Habit) {
    if (type === 'event')  setEditingEvent(item as Event)
    if (type === 'task')   setEditingTask(item as Task)
    if (type === 'habit')  setEditingHabit(item as Habit)
    setTimeout(() => setActiveForm(type), 50)
  }

  function closeForm() {
    setActiveForm(null)
    setEditingEvent(null)
    setEditingTask(null)
    setEditingHabit(null)
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <div className="pt-12 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#e2e2f0] tracking-tight">Agenda</h1>
        <button
          onClick={() => setPickerOpen(true)}
          className="w-9 h-9 bg-[#6366f1] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <i className="ti ti-plus text-white" style={{ fontSize: 18 }} />
        </button>
      </div>

      <DayStrip selected={selected} onSelect={setSelected} />

      <div className="px-4 mb-3">
        <p className="text-[12px] text-[#6b6b80] capitalize">{dateLabel}</p>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-6">
        {events.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">Eventos</p>
            <div className="flex flex-col gap-2">
              {events.map(e => (
                <EventCard key={e.id} event={e}
                  onEdit={ev => openEdit('event', ev)}
                  onTap={ev => setDetailEvent(ev)}
                />
              ))}
            </div>
          </section>
        )}
        {tasks.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">Tarefas</p>
            {tasks.map(t => (
              <TaskRow key={t.id} task={t}
                onEdit={tk => openEdit('task', tk)}
                onTap={tk => setDetailTask(tk)}
              />
            ))}
          </section>
        )}
        {habits.length > 0 && (
          <section>
            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-1">Hábitos</p>
            {habits.map(h => (
              <HabitRow key={h.id} habit={h}
                log={habitLogs.find(l => l.habit_id === h.id)}
                date={selected}
                onEdit={hb => openEdit('habit', hb)}
                onTap={hb => setDetailHabit(hb)}
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

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="O que deseja criar?">
        <div className="flex flex-col gap-2">
          {CREATE_OPTIONS.map(({ type, icon, label, desc }) => (
            <button key={type} onClick={() => openForm(type)}
              className="flex items-center gap-4 p-4 bg-[#13131f] rounded-2xl border border-[#1e1e32] active:bg-[#1a1a2e] transition-colors text-left w-full">
              <div className="w-10 h-10 rounded-xl bg-[#2d2b5e] flex items-center justify-center flex-shrink-0">
                <i className={`ti ${icon} text-[#6366f1]`} style={{ fontSize: 20 }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#e2e2f0]">{label}</p>
                <p className="text-[12px] text-[#6b6b80] mt-0.5">{desc}</p>
              </div>
              <i className="ti ti-chevron-right text-[#3a3a50] ml-auto" style={{ fontSize: 16 }} />
            </button>
          ))}
        </div>
      </BottomSheet>

      <EventForm open={activeForm === 'event'} onClose={closeForm} defaultDate={selected} editing={editingEvent} />
      <TaskForm  open={activeForm === 'task'}  onClose={closeForm} defaultDate={selected} editing={editingTask} />
      <HabitForm open={activeForm === 'habit'} onClose={closeForm} editing={editingHabit} />

      <EventDetail
        event={detailEvent} onClose={() => setDetailEvent(null)}
        onEdit={ev => openEdit('event', ev)}
      />
      <TaskDetail
        task={detailTask} onClose={() => setDetailTask(null)}
        onEdit={tk => openEdit('task', tk)}
      />
      <HabitDetail
        habit={detailHabit}
        log={habitLogs.find(l => l.habit_id === detailHabit?.id)}
        onClose={() => setDetailHabit(null)}
        onEdit={hb => openEdit('habit', hb)}
      />
    </div>
  )
}
