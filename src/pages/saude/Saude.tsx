import { useState } from 'react'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTodayCheckin, useWorkoutTemplates, useWorkoutLogs, useBodyMetrics, useDeleteTemplate, useDeleteWorkoutLog, useTemplateExercises } from '@/hooks/useSaude'
import { CheckinCard } from '@/components/saude/CheckinCard'
import { TemplateForm } from '@/components/saude/TemplateForm'
import { BodyMetricForm } from '@/components/saude/BodyMetricForm'
import { ActiveWorkoutScreen } from '@/components/saude/ActiveWorkout'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { WorkoutTemplate, ActiveWorkout, ActiveSet } from '@/types/saude'

type FormType = 'template' | 'metric' | null
type Section  = 'checkin' | 'treinos' | 'metricas'

const CREATE_OPTIONS = [
  { type: 'template' as FormType, icon: 'ti-clipboard-list', label: 'Nova ficha', desc: 'Criar ficha de treino' },
  { type: 'metric'   as FormType, icon: 'ti-ruler-measure',  label: 'Métricas',   desc: 'Peso e medidas corporais' },
]

export function Saude() {
  const today = new Date()
  const [currentMonth, setCurrentMonth]       = useState(today)
  const [activeSection, setActiveSection]     = useState<Section>('checkin')
  const [pickerOpen, setPickerOpen]           = useState(false)
  const [activeForm, setActiveForm]           = useState<FormType>(null)
  const [activeWorkout, setActiveWorkout]     = useState<ActiveWorkout | null>(null)
  const [startPickerOpen, setStartPickerOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)

  const { data: checkin }          = useTodayCheckin(today)
  const { data: templates = [] }   = useWorkoutTemplates()
  const { data: workoutLogs = [] } = useWorkoutLogs(currentMonth)
  const { data: bodyMetrics = [] } = useBodyMetrics()
  const { data: templateExercises = [] } = useTemplateExercises(selectedTemplate?.id ?? null)
  const deleteTemplate   = useDeleteTemplate()
  const deleteWorkoutLog = useDeleteWorkoutLog()

  function startWorkout(template: WorkoutTemplate) {
    setSelectedTemplate(template)
    setStartPickerOpen(false)
  }

  function beginWorkout() {
    if (!selectedTemplate) return
    const sets: ActiveSet[] = []
    templateExercises.forEach(ex => {
      const numSets = ex.default_sets ?? 3
      for (let s = 1; s <= numSets; s++) {
        sets.push({
          exercise_name: ex.exercise_name,
          set_number: s,
          reps: ex.default_reps?.toString() ?? '',
          weight_kg: ex.default_weight_kg?.toString() ?? '',
          done: false,
        })
      }
    })
    setActiveWorkout({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      startedAt: new Date(),
      sets,
    })
    setSelectedTemplate(null)
  }

  const weightData = [...bodyMetrics]
    .filter(m => m.weight_kg)
    .reverse()
    .map(m => ({
      date: format(parseISO(m.date), 'd/MM'),
      peso: m.weight_kg,
    }))

  if (activeWorkout) {
    return (
      <ActiveWorkoutScreen
        workout={activeWorkout}
        onFinish={() => setActiveWorkout(null)}
        onCancel={() => setActiveWorkout(null)}
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <div className="pt-12 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#e2e2f0] tracking-tight">Saúde</h1>
        <button onClick={() => setPickerOpen(true)}
          className="w-9 h-9 bg-[#6366f1] rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <i className="ti ti-plus text-white" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {([
            { key: 'checkin',  label: 'Check-in' },
            { key: 'treinos',  label: 'Treinos' },
            { key: 'metricas', label: 'Métricas' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                activeSection === key ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#6b6b80]'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">

        {activeSection === 'checkin' && (
          <CheckinCard date={today} checkin={checkin ?? null} />
        )}

        {activeSection === 'treinos' && (
          <div>
            <button
              onClick={() => setStartPickerOpen(true)}
              className="w-full bg-[#6366f1] rounded-2xl p-4 flex items-center gap-3 mb-5 active:opacity-90"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <i className="ti ti-player-play text-white" style={{ fontSize: 20 }} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold text-white">Iniciar treino</p>
                <p className="text-[12px] text-white/70">Selecione uma ficha para começar</p>
              </div>
            </button>

            {templates.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">Fichas</p>
                {templates.map(t => (
                  <SwipeableRow key={t.id}
                    actions={[
                      { icon: 'ti-trash', color: 'var(--swipe-delete-color)', bg: 'var(--swipe-delete-bg)', onPress: () => deleteTemplate.mutate(t.id) },
                    ]}
                  >
                    <div className="flex items-center gap-3 py-3 border-b border-[#13131f] bg-[#0a0a0f]">
                      <div className="w-9 h-9 rounded-xl bg-[#2d2b5e] flex items-center justify-center flex-shrink-0">
                        <i className="ti ti-clipboard-list text-[#6366f1]" style={{ fontSize: 16 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#e2e2f0] truncate">{t.name}</p>
                        {t.description && (
                          <p className="text-[11px] text-[#6b6b80] truncate">{t.description}</p>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70">
                <i className="ti ti-chevron-left text-[#6b6b80]" style={{ fontSize: 14 }} />
              </button>
              <p className="flex-1 text-center text-[13px] font-semibold text-[#e2e2f0] capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </p>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center active:opacity-70">
                <i className="ti ti-chevron-right text-[#6b6b80]" style={{ fontSize: 14 }} />
              </button>
            </div>

            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">Histórico</p>
            {workoutLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <i className="ti ti-barbell text-[#3a3a50]" style={{ fontSize: 28 }} />
                <p className="text-[#3a3a50] text-sm">Nenhum treino este mês</p>
              </div>
            ) : (
              workoutLogs.map(log => (
                <SwipeableRow key={log.id}
                  actions={[
                    { icon: 'ti-trash', color: 'var(--swipe-delete-color)', bg: 'var(--swipe-delete-bg)', onPress: () => deleteWorkoutLog.mutate(log.id) },
                  ]}
                >
                  <div className="flex items-center gap-3 py-3 border-b border-[#13131f] bg-[#0a0a0f]">
                    <div className="w-9 h-9 rounded-xl bg-[#13131f] border border-[#1e1e32] flex items-center justify-center flex-shrink-0">
                      <i className="ti ti-barbell text-[#6366f1]" style={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#e2e2f0]">
                        {format(parseISO(log.date), "EEEE, d 'de' MMM", { locale: ptBR })}
                      </p>
                      <p className="text-[11px] text-[#6b6b80] mt-0.5">
                        {[
                          log.duration_minutes ? `${log.duration_minutes}min` : null,
                          log.perceived_effort ? `Esforço ${log.perceived_effort}/10` : null,
                        ].filter(Boolean).join(' · ')}
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-[#6b6b80] mt-0.5 italic">"{log.notes}"</p>
                      )}
                    </div>
                  </div>
                </SwipeableRow>
              ))
            )}
          </div>
        )}

        {activeSection === 'metricas' && (
          <div>
            {weightData.length >= 2 && (
              <div className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-4 mb-4">
                <p className="text-[12px] font-semibold text-[#6b6b80] uppercase tracking-widest mb-3">Evolução do peso</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={weightData} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b6b80' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b6b80' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number) => [`${v}kg`, 'Peso']}
                      contentStyle={{ background: '#13131f', border: '1px solid #1e1e32', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#e2e2f0' }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="#6366f1" strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest mb-2">Registros</p>
            {bodyMetrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <i className="ti ti-ruler-measure text-[#3a3a50]" style={{ fontSize: 28 }} />
                <p className="text-[#3a3a50] text-sm">Nenhuma métrica registrada</p>
              </div>
            ) : (
              bodyMetrics.map(m => (
                <div key={m.id} className="bg-[#13131f] rounded-2xl border border-[#1e1e32] p-3 mb-2">
                  <p className="text-[12px] font-semibold text-[#e2e2f0] mb-2 capitalize">
                    {format(parseISO(m.date), "d 'de' MMMM yyyy", { locale: ptBR })}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {m.weight_kg && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Peso</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.weight_kg}kg</span>
                      </div>
                    )}
                    {m.waist_cm && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Cintura</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.waist_cm}cm</span>
                      </div>
                    )}
                    {m.hip_cm && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Quadril</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.hip_cm}cm</span>
                      </div>
                    )}
                    {m.chest_cm && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Peito</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.chest_cm}cm</span>
                      </div>
                    )}
                    {m.arm_cm && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Braço</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.arm_cm}cm</span>
                      </div>
                    )}
                    {m.thigh_cm && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#3a3a50] uppercase tracking-widest">Coxa</span>
                        <span className="text-[13px] font-semibold text-[#e2e2f0]">{m.thigh_cm}cm</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Picker de criação */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="O que deseja registrar?">
        <div className="flex flex-col gap-2">
          {CREATE_OPTIONS.map(({ type, icon, label, desc }) => (
            <button key={type}
              onClick={() => { setPickerOpen(false); setTimeout(() => setActiveForm(type), 150) }}
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

      {/* Picker de seleção de ficha */}
      <BottomSheet open={startPickerOpen} onClose={() => setStartPickerOpen(false)} title="Selecionar ficha">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <p className="text-[#6b6b80] text-sm">Nenhuma ficha criada ainda</p>
            <button onClick={() => { setStartPickerOpen(false); setTimeout(() => setActiveForm('template'), 150) }}
              className="text-[#6366f1] text-[13px] font-semibold mt-2">
              Criar primeira ficha →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => startWorkout(t)}
                className="flex items-center gap-4 p-4 bg-[#13131f] rounded-2xl border border-[#1e1e32] active:bg-[#1a1a2e] text-left w-full">
                <div className="w-10 h-10 rounded-xl bg-[#2d2b5e] flex items-center justify-center flex-shrink-0">
                  <i className="ti ti-clipboard-list text-[#6366f1]" style={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#e2e2f0]">{t.name}</p>
                  {t.description && <p className="text-[12px] text-[#6b6b80] mt-0.5">{t.description}</p>}
                </div>
                <i className="ti ti-player-play text-[#1d9e75] ml-auto" style={{ fontSize: 18 }} />
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      {/* Preview da ficha antes de iniciar */}
      <BottomSheet
        open={!!selectedTemplate && templateExercises.length > 0}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name ?? ''}
      >
        <div className="mb-4">
          <p className="text-[13px] text-[#6b6b80] mb-3">{templateExercises.length} exercícios</p>
          {templateExercises.map(ex => (
            <div key={ex.id} className="flex items-center gap-3 py-2 border-b border-[#13131f]">
              <i className="ti ti-point-filled text-[#6366f1]" style={{ fontSize: 10 }} />
              <p className="flex-1 text-[13px] text-[#a5a5c0]">{ex.exercise_name}</p>
              <p className="text-[11px] text-[#3a3a50]">
                {ex.default_sets}x{ex.default_reps}
                {ex.default_weight_kg ? ` · ${ex.default_weight_kg}kg` : ''}
              </p>
            </div>
          ))}
        </div>
        <button onClick={beginWorkout}
          className="w-full bg-[#6366f1] text-white rounded-xl py-3 text-[14px] font-bold active:opacity-90">
          <i className="ti ti-player-play mr-2" style={{ fontSize: 14 }} />
          Começar treino
        </button>
      </BottomSheet>

      <TemplateForm   open={activeForm === 'template'} onClose={() => setActiveForm(null)} />
      <BodyMetricForm open={activeForm === 'metric'}   onClose={() => setActiveForm(null)} />
    </div>
  )
}
