import { useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { supabase, getCurrentUserId } from '@/lib/supabase'

interface Preferences {
  checkin_enabled: boolean
  checkin_time: string
  habitos_enabled: boolean
  habitos_time: string
  tarefas_enabled: boolean
  eventos_enabled: boolean
}

const defaults: Preferences = {
  checkin_enabled: true,
  checkin_time: '21:00',
  habitos_enabled: true,
  habitos_time: '21:30',
  tarefas_enabled: true,
  eventos_enabled: true,
}

export function NotificationSettings() {
  const { subscribe, unsubscribe, isSubscribed, permission, error } = usePushNotifications()
  const [prefs, setPrefs] = useState<Preferences>(defaults)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleToggleSubscription() {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  function set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  async function savePreferences() {
    setSaving(true)
    setSaved(false)
    try {
      const userId = await getCurrentUserId()
      await supabase.from('notification_preferences').upsert(
        { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] text-[#6366f1]">build check v1 — {new Date().toISOString().slice(0,10)}</p>
      <div className="bg-[#13131f] border border-[#1e1e32] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Ativar notificações</p>
          <p className="text-[11px] text-[#6b6b80] mt-0.5">
            {permission === 'denied'
              ? 'Permissão negada'
              : isSubscribed
              ? 'Notificações ativas'
              : 'Receba alertas do Arnonize'}
          </p>
        </div>
        <button
          onClick={handleToggleSubscription}
          disabled={permission === 'denied'}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isSubscribed ? 'bg-[#6366f1]' : 'bg-[#1e1e32]'
          } disabled:opacity-40`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isSubscribed ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-[#f87171] px-1">{error}</p>
      )}

      {permission === 'denied' && (
        <p className="text-[12px] text-[#f87171] px-1">
          Permissão negada. Ative nas configurações do iPhone.
        </p>
      )}

      {isSubscribed && permission !== 'denied' && (
        <>
          <p className="text-[11px] font-semibold text-[#3a3a50] uppercase tracking-widest px-1">
            Preferências
          </p>

          <div className="bg-[#13131f] border border-[#1e1e32] rounded-2xl divide-y divide-[#1e1e32]">
            <PreferenceRow
              label="Check-in diário"
              description="Lembrete noturno de reflexão"
              enabled={prefs.checkin_enabled}
              onToggle={v => set('checkin_enabled', v)}
              time={prefs.checkin_time}
              onTimeChange={v => set('checkin_time', v)}
            />
            <PreferenceRow
              label="Hábitos"
              description="Revisão dos hábitos do dia"
              enabled={prefs.habitos_enabled}
              onToggle={v => set('habitos_enabled', v)}
              time={prefs.habitos_time}
              onTimeChange={v => set('habitos_time', v)}
            />
            <PreferenceRow
              label="Tarefas com prazo"
              description="Conforme prioridade"
              enabled={prefs.tarefas_enabled}
              onToggle={v => set('tarefas_enabled', v)}
            />
            <PreferenceRow
              label="Lembretes de eventos"
              description="Conforme cadastro"
              enabled={prefs.eventos_enabled}
              onToggle={v => set('eventos_enabled', v)}
            />
          </div>

          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#6366f1] text-white text-sm font-semibold active:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Salvando…' : saved ? 'Salvo!' : 'Salvar preferências'}
          </button>
        </>
      )}
    </div>
  )
}

interface PreferenceRowProps {
  label: string
  description: string
  enabled: boolean
  onToggle: (v: boolean) => void
  time?: string
  onTimeChange?: (v: string) => void
}

function PreferenceRow({ label, description, enabled, onToggle, time, onTimeChange }: PreferenceRowProps) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-[11px] text-[#6b6b80]">{description}</p>
      </div>
      {time !== undefined && onTimeChange && (
        <input
          type="time"
          value={time}
          onChange={e => onTimeChange(e.target.value)}
          disabled={!enabled}
          className="text-xs text-[#6b6b80] bg-[#0d0d14] border border-[#1e1e32] rounded-lg px-2 py-1 disabled:opacity-40"
        />
      )}
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-[#6366f1]' : 'bg-[#1e1e32]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
