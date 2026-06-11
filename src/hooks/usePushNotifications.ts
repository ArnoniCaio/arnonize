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

    const userId = await getCurrentUserId()
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        subscription: JSON.stringify(sub),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    setIsSubscribed(true)
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()

    const userId = await getCurrentUserId()
    await supabase.from('push_subscriptions').delete().eq('user_id', userId)

    setIsSubscribed(false)
  }

  return { subscribe, unsubscribe, isSubscribed, permission }
}
