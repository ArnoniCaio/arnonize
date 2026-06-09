import { useState, useEffect } from 'react'
import { DailyCheckin } from '@/types/saude'
import { useUpsertCheckin, useCheckinsByMonth } from '@/hooks/useSaude'
import {
  format, parseISO, isSameDay, isAfter, startOfDay,
  eachDayOfInterval, getDay, startOfMonth, endOfMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  date: Date
  checkin: DailyCheckin | null
}

function ScaleSelector({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(v => (
        <button key={v} onClick={() => onChange(v === value ? 0 : v)}
          className="flex-1 h-9 rounded-xl text-[13px] font-semibold transition-colors"
          style={{
            background: v <= value ? `${color}33` : '#13131f',
            color: v <= value ? color : '#3a3a50',
            border: `1px solid ${v <= value ? color : '#1e1e32'}`
          }}>
          {v}
        </button>
      ))}
    </div>
  )
}

function CheckinDetailCard({ checkin }: { checkin: DailyCheckin }) {
  const emojis = ['', '😞', '😕', '😐', '🙂', '😄']
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#13131f] rounded-xl p-3 flex flex-col items-center gap-1 border border-[#1e1e32]">
          <p className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Humor</p>
          <p className="text-[24px]">{checkin.mood ? emojis[checkin.mood] : '—'}</p>
          {checkin.mood && <p className="text-[11px] text-[#6b6b80]">{checkin.mood}/5</p>}
        </div>
        <div className="bg-[#13131f] rounded-xl p-3 flex flex-col items-center gap-1 border border-[#1e1e32]">
          <p className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Energia</p>
          <p className="text-[22px] font-bold text-[#ba7517]">{checkin.energy ?? '—'}</p>
          {checkin.energy && <p className="text-[11px] text-[#6b6b80]">/5</p>}
        </div>
        <div className="bg-[#13131f] rounded-xl p-3 flex flex-col items-center gap-1 border border-[#1e1e32]">
          <p className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Sono</p>
          <p className="text-[22px] font-bold text-[#6366f1]">{checkin.sleep_hours ?? '—'}</p>
          {checkin.sleep_hours && <p className="text-[11px] text-[#6b6b80]">horas</p>}
        </div>
      </div>
      {checkin.notes && (
        <div className="bg-[#13131f] rounded-xl p-3 border border-[#1e1e32]">
          <p className="text-[10px] text-[#3a3a50] uppercase tracking-widest mb-1">Notas</p>
          <p className="text-[13px] text-[#a5a5c0] italic">"{checkin.notes}"</p>
        </div>
      )}
    </div>
  )
}

function moodColor(checkin: DailyCheckin): string {
  if (!checkin.mood) return '#6366f1'
  if (checkin.mood <= 2) return '#ef4444'
  if (checkin.mood === 3) return '#ba7517'
  return '#1d9e75'
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function CheckinCalendar({ checkins, onSelectCheckin, month, year }: {
  checkins: DailyCheckin[]
  onSelectCheckin: (c: DailyCheckin) => void
  month: number
  year: number
}) {
  const today    = startOfDay(new Date())
  const firstDay = new Date(year, month, 1)
  const days     = eachDayOfInterval({ start: startOfMonth(firstDay), end: endOfMonth(firstDay) })
  const startPad = getDay(firstDay)

  function checkinForDay(day: Date): DailyCheckin | null {
    return checkins.find(c => isSameDay(parseISO(c.date), day)) ?? null
  }

  return (
    <div className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-4">
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map(d => (
          <p key={d} className="text-center text-[10px] font-semibold text-[#3a3a50] uppercase">{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(day => {
          const checkin    = checkinForDay(day)
          const isToday    = isSameDay(day, today)
          const isFuture   = isAfter(day, today)
          const isClickable = !!checkin && !isFuture

          return (
            <button
              key={day.toISOString()}
              disabled={!isClickable}
              onClick={() => isClickable ? onSelectCheckin(checkin!) : undefined}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                isToday ? 'bg-[#2d2b5e] border border-[#6366f1]' : ''
              } ${isClickable ? 'active:opacity-70' : ''}`}
            >
              <span className={`text-[13px] font-medium leading-none ${
                isFuture ? 'text-[#1e1e32]' : isToday ? 'text-[#6366f1]' : checkin ? 'text-[#a5a5c0]' : 'text-[#3a3a50]'
              }`}>
                {format(day, 'd')}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full mt-1"
                style={{ background: isClickable ? moodColor(checkin!) : 'transparent' }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CheckinCard({ date, checkin }: Props) {
  const today = new Date()
  const upsert = useUpsertCheckin()

  const [mood, setMood]     = useState(checkin?.mood ?? 0)
  const [energy, setEnergy] = useState(checkin?.energy ?? 0)
  const [sleep, setSleep]   = useState(checkin?.sleep_hours?.toString() ?? '')
  const [notes, setNotes]   = useState(checkin?.notes ?? '')
  const [saved, setSaved]   = useState(false)
  const [selectedCheckin, setSelectedCheckin] = useState<DailyCheckin | null>(null)
  const [calendarYear, setCalendarYear]   = useState(today.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())

  const { data: monthCheckins = [] } = useCheckinsByMonth(calendarYear, calendarMonth)

  const isCurrentMonth = calendarYear === today.getFullYear() && calendarMonth === today.getMonth()

  useEffect(() => {
    setMood(checkin?.mood ?? 0)
    setEnergy(checkin?.energy ?? 0)
    setSleep(checkin?.sleep_hours?.toString() ?? '')
    setNotes(checkin?.notes ?? '')
  }, [checkin])

  async function handleSave() {
    await upsert.mutateAsync({
      date: format(date, 'yyyy-MM-dd'),
      mood: mood || null,
      energy: energy || null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      notes: notes.trim() || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function prevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(y => y - 1)
    } else {
      setCalendarMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (isCurrentMonth) return
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(y => y + 1)
    } else {
      setCalendarMonth(m => m + 1)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Card de hoje */}
      <div className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-[#e2e2f0]">Check-in de hoje</p>
          {checkin && <span className="text-[11px] text-[#1d9e75] font-medium">✓ registrado</span>}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">Humor</p>
            <ScaleSelector value={mood} onChange={setMood} color="#6366f1" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">Energia</p>
            <ScaleSelector value={energy} onChange={setEnergy} color="#ba7517" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">Horas de sono</p>
            <input type="number" inputMode="decimal" step="0.5" min="0" max="24"
              placeholder="Ex: 7.5" value={sleep} onChange={e => setSleep(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e32] rounded-xl px-3 h-[48px] text-[14px] text-[#e2e2f0] placeholder-[#3a3a50] focus:outline-none focus:border-[#6366f1]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-2">Notas</p>
            <textarea placeholder="Como foi o dia?" value={notes}
              onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-[#0a0a0f] border border-[#1e1e32] rounded-xl px-3 py-3 text-[14px] text-[#e2e2f0] placeholder-[#3a3a50] focus:outline-none focus:border-[#6366f1] resize-none" />
          </div>
        </div>
        <button onClick={handleSave} disabled={upsert.isPending}
          className={`w-full mt-4 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
            saved ? 'bg-[#0d3330] text-[#1d9e75]' : 'bg-[#6366f1] text-white'
          } disabled:opacity-40`}>
          {upsert.isPending ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar check-in'}
        </button>
      </div>

      {/* Header do calendário */}
      <div className="flex items-center justify-between px-1">
        <button onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center text-[#6b6b80] active:text-[#e2e2f0] transition-colors">
          <i className="ti ti-chevron-left" style={{ fontSize: 18 }} />
        </button>
        <p className="text-[13px] font-semibold text-[#e2e2f0] capitalize">
          {format(new Date(calendarYear, calendarMonth, 1), 'MMMM yyyy', { locale: ptBR })}
        </p>
        <button onClick={nextMonth} disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center text-[#6b6b80] active:text-[#e2e2f0] transition-colors disabled:opacity-20">
          <i className="ti ti-chevron-right" style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Calendário */}
      <CheckinCalendar
        checkins={monthCheckins}
        onSelectCheckin={setSelectedCheckin}
        month={calendarMonth}
        year={calendarYear}
      />

      {/* BottomSheet — detalhe de um dia */}
      <BottomSheet
        open={!!selectedCheckin}
        onClose={() => setSelectedCheckin(null)}
        title={selectedCheckin ? format(parseISO(selectedCheckin.date), "EEEE, d 'de' MMMM", { locale: ptBR }) : ''}
      >
        {selectedCheckin && <CheckinDetailCard checkin={selectedCheckin} />}
      </BottomSheet>
    </div>
  )
}
