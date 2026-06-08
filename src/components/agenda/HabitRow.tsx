import { Habit, HabitLog } from '@/types/agenda'
import { useToggleHabit } from '@/hooks/useAgenda'
import { format } from 'date-fns'

interface Props {
  habit: Habit
  log: HabitLog | undefined
  date: Date
}

export function HabitRow({ habit, log, date }: Props) {
  const toggle = useToggleHabit()
  const dateStr = format(date, 'yyyy-MM-dd')

  if (habit.tracking_type === 'boolean') {
    const done = log?.completed ?? false
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-[#13131f]">
        <button
          onClick={() => toggle.mutate({ habit_id: habit.id, date: dateStr, completed: !done })}
          className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border ${
            done ? 'bg-[#2d2b5e] border-[#6366f1]' : 'bg-[#13131f] border-[#3a3a50]'
          }`}
        >
          {done && <i className="ti ti-check text-[#6366f1]" style={{ fontSize: 12 }} />}
        </button>
        <p className="flex-1 text-[13px] text-[#a5a5c0]">{habit.name}</p>
      </div>
    )
  }

  const score = log?.score ?? 0
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#13131f]">
      <p className="flex-1 text-[13px] text-[#a5a5c0]">{habit.name}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => toggle.mutate({ habit_id: habit.id, date: dateStr, score: v })}
            className={`w-6 h-6 rounded-md text-[11px] font-semibold transition-colors ${
              v <= score
                ? 'bg-[#2d2b5e] text-[#6366f1]'
                : 'bg-[#13131f] text-[#3a3a50] border border-[#1e1e32]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
