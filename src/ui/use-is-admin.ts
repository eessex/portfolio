'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

/** Shared across callers: one session request per page load */
let isAdminPromise: Promise<boolean> | null = null
let isAdminSynced = false
const listeners = new Set<(isAdmin: boolean) => void>()

function fetchIsAdmin() {
  isAdminPromise ??= fetch('/api/session')
    .then((res) => res.json())
    .then((data) => !!data?.isAuthed)
    .catch(() => {
      // allow a later mount to retry
      isAdminPromise = null
      return false
    })

  return isAdminPromise
}

/**
 * Pushes the server's session answer to every caller. Login and
 * logout re-render the layout without a full page load, so mounted
 * callers would otherwise keep the answer from before.
 */
export function syncIsAdmin(isAdmin: boolean) {
  isAdminSynced = isAdmin
  isAdminPromise = Promise.resolve(isAdmin)
  listeners.forEach((listener) => listener(isAdmin))
}

/**
 * Whether the current visitor has an admin session, resolved via
 * /api/session, shared across callers and updated by `syncIsAdmin`
 * when the session changes. False while resolving and
 * for anonymous visitors. UX only — never a security boundary: the
 * data API routes gate drafts on the session cookie server-side.
 */
export function useIsAdmin(isEnabled = true) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isEnabled) return

    let isCancelled = false
    const promise = fetchIsAdmin()

    promise.then((isAdminAnswer) => {
      // a later sync supersedes this answer
      if (!isCancelled && promise === isAdminPromise)
        setIsAdmin(isAdminAnswer)
    })
    listeners.add(setIsAdmin)

    return () => {
      isCancelled = true
      listeners.delete(setIsAdmin)
    }
  }, [isEnabled])

  return isEnabled && isAdmin
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

/**
 * Only the answer `syncIsAdmin` pushes from the server-read session,
 * never a /api/session request: for callers too common to pay one
 * on every anonymous page load. False until the first sync.
 */
export function useSyncedIsAdmin() {
  return useSyncExternalStore(
    subscribe,
    () => isAdminSynced,
    () => false
  )
}

/** Test-only: clear the shared session result between tests */
export function resetIsAdminCache() {
  isAdminPromise = null
  isAdminSynced = false
}
