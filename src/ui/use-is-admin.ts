'use client'

import { useEffect, useState } from 'react'

/** Shared across callers: one session request per page load */
let isAdminPromise: Promise<boolean> | null = null
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

    promise.then((value) => {
      // a later sync supersedes this answer
      if (!isCancelled && promise === isAdminPromise)
        setIsAdmin(value)
    })
    listeners.add(setIsAdmin)

    return () => {
      isCancelled = true
      listeners.delete(setIsAdmin)
    }
  }, [isEnabled])

  return isEnabled && isAdmin
}

/** Test-only: clear the shared session result between tests */
export function resetIsAdminCache() {
  isAdminPromise = null
}
