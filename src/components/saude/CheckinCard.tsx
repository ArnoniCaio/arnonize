import { useState, useEffect } from 'react'
import { DailyCheckin } from '@/types/saude'
import { useUpsertCheckin, useCheckinHistory } from '@/hooks/useSaude'
import { format, parseISO } from 'date-fns'
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

export function CheckinCard({ date, checkin }: Props) {
  const upsert = useUpsertCheckin()
  const { data: history = [] } = useCheckinHistory()

  const [mood, setMood]     = useState(checkin?.mood ?? 0)
  const [energy, setEnergy] = useState(checkin?.energy ?? 0)
  const [sleep, setSleep]   = useState(checkin?.sleep_hours?.toString() ?? '')
  const [notes, setNotes]   = useState(checkin?.notes ?? '')
  const [saved, setSaved]   = useState(false)
  const [historyOpen, setHistoryOpen]         = useState(false)
  const [selectedCheckin, setSelectedCheckin] = useState<DailyCheckin | null>(null)

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

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const pastHistory = history.filter(h => h.date !== todayStr)

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

      {/* Botão histórico */}
      {pastHistory.length > 0 && (
        <button
          onClick={() => setHistoryOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-[#13131f] rounded-2xl border border-[#1e1e32] active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d2b5e] flex items-center justify-center">
              <i className="ti ti-history text-[#6366f1]" style={{ fontSize: 18 }} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-[#e2e2f0]">Ver histórico</p>
              <p className="text-[11px] text-[#6b6b80]">{pastHistory.length} registros anteriores</p>
            </div>
          </div>
          <i className="ti ti-chevron-right text-[#3a3a50]" style={{ fontSize: 16 }} />
        </button>
      )}

      {/* BottomSheet — lista de dias */}
      <BottomSheet open={historyOpen} onClose={() => setHistoryOpen(false)} title="Histórico de check-ins">
        <div className="flex flex-col gap-2">
          {pastHistory.map(h => (
            <button key={h.id}
              onClick={() => { setSelectedCheckin(h); setHistoryOpen(false) }}
              className="flex items-center gap-3 p-3 bg-[#13131f] rounded-2xl border border-[#1e1e32] active:bg-[#1a1a2e] text-left w-full"
            >
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#e2e2f0] capitalize">
                  {format(parseISO(h.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <div className="flex gap-3 mt-1">
                  {h.mood        && <span className="text-[11px] text-[#6b6b80]">Humor {h.mood}/5</span>}
                  {h.energy      && <span className="text-[11px] text-[#6b6b80]">Energia {h.energy}/5</span>}
                  {h.sleep_hours && <span className="text-[11px] text-[#6b6b80]">{h.sleep_hours}h sono</span>}
                </div>
              </div>
              <i className="ti ti-chevron-right text-[#3a3a50]" style={{ fontSize: 14 }} />
            </button>
          ))}
        </div>
      </BottomSheet>

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
