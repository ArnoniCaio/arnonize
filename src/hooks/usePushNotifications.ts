import { useState, useEffect } from 'react'
import { supabase, getCurrentUserId } from '@/lib/supabase'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPermission(Notification.permission)
    checkSubscription()
  }, [])

  async function checkSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setIsSubscribed(!!sub)
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setError(null)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      })

      const key = sub.getKey('p256dh')
      const authKey = sub.getKey('auth')

      const userId = await getCurrentUserId()
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: sub.endpoint,
          p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : '',
          auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))) : '',
        },
        { onConflict: 'user_id,endpoint' }
      )

      setIsSubscribed(true)
    } catch (err) {
      console.error('[usePushNotifications] subscribe error:', err)
      setError('Não foi possível ativar as notificações. Tente novamente.')
    }
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()

      const userId = await getCurrentUserId()
      await supabase.from('push_subscriptions').delete().eq('user_id', userId)

      setIsSubscribed(false)
    } catch (err) {
      console.error('[usePushNotifications] unsubscribe error:', err)
      setError('Não foi possível desativar as notificações. Tente novamente.')
    }
  }

  return { subscribe, unsubscribe, isSubscribed, permission, error }
}
