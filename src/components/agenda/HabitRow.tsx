import { Habit, HabitLog } from '@/types/agenda'
import { useToggleHabit, useDeleteHabit, useHabitStreak } from '@/hooks/useAgenda'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { format } from 'date-fns'

interface Props {
  habit: Habit
  log: HabitLog | undefined
  date: Date
  onEdit: (habit: Habit) => void
  onTap: (habit: Habit) => void
}

export function HabitRow({ habit, log, date, onEdit, onTap }: Props) {
  const toggle = useToggleHabit()
  const deleteHabit = useDeleteHabit()
  const { data: streak = 0 } = useHabitStreak(habit.id)
  const dateStr = format(date, 'yyyy-MM-dd')

  return (
    <SwipeableRow
      actions={[
        { icon: 'ti-pencil', color: 'var(--swipe-edit-color)',   bg: 'var(--swipe-edit-bg)',   onPress: () => onEdit(habit) },
        { icon: 'ti-trash',  color: 'var(--swipe-delete-color)', bg: 'var(--swipe-delete-bg)', onPress: () => deleteHabit.mutate(habit.id) },
      ]}
    >
      <div className="flex items-center gap-3 py-2.5 border-b border-[#13131f] bg-[#0a0a0f]">
        {habit.tracking_type === 'boolean' ? (
          <>
            <button
              onClick={e => { e.stopPropagation(); toggle.mutate({ habit_id: habit.id, date: dateStr, completed: !(log?.completed ?? false) }) }}
              className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors ${
                log?.completed ? 'bg-[#2d2b5e] border-[#6366f1]' : 'bg-[#13131f] border-[#3a3a50]'
              }`}
            >
              {log?.completed && <i className="ti ti-check text-[#6366f1]" style={{ fontSize: 12 }} />}
            </button>
            <div className="flex-1 min-w-0" onClick={() => onTap(habit)}>
              <p className="text-[13px] text-[#a5a5c0]">{habit.name}</p>
              {streak >= 2 && <span className="text-[11px] text-[#ba7517]">🔥 {streak} dias seguidos</span>}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0" onClick={() => onTap(habit)}>
              <p className="text-[13px] text-[#a5a5c0]">{habit.name}</p>
              {streak >= 2 && <span className="text-[11px] text-[#ba7517]">🔥 {streak} dias seguidos</span>}
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={e => { e.stopPropagation(); toggle.mutate({ habit_id: habit.id, date: dateStr, score: v }) }}
                  className={`w-6 h-6 rounded-md text-[11px] font-semibold transition-colors ${
                    v <= (log?.score ?? 0) ? 'bg-[#2d2b5e] text-[#6366f1]' : 'bg-[#13131f] text-[#3a3a50] border border-[#1e1e32]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </SwipeableRow>
  )
}
