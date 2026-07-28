'use client'

import { useEffect, useState } from 'react'

/** Shared across callers: one session request per page load */
let isAdminPromise: Promise<boolean> | null = null

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
 * Whether the current visitor has an admin session, resolved via
 * /api/session and shared across callers. False while resolving and
 * for anonymous visitors. UX only — never a security boundary: the
 * data API routes gate drafts on the session cookie server-side.
 */
export function useIsAdmin(enabled = true) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    fetchIsAdmin().then((value) => {
      if (!cancelled && value) setIsAdmin(true)
    })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return isAdmin
}

/** Test-only: clear the shared session result between tests */
export function resetIsAdminCache() {
  isAdminPromise = null
}
