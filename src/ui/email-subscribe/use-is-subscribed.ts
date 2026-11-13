'use client'

import Cookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

/** Shared, so the footer and mobile tray copies hide together */
export function useIsSubscribed() {
  return useSyncExternalStore(
    subscribe,
    () => !!Cookies.get('is_subscribed'),
    () => false
  )
}

export function markSubscribed() {
  Cookies.set('is_subscribed', '1', { expires: 1 })
  listeners.forEach((listener) => listener())
}
