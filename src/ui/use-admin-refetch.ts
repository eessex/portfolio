'use client'

import { useEffect, useState } from 'react'

import { useIsAdmin } from '@/ui/useIsAdmin'

/**
 * Client-side draft augmentation: starts from the statically rendered
 * published data; whenever the visitor becomes a signed-in admin this
 * refetches `url` (the API gates drafts on the session cookie) and
 * shows what `pick` reads from the response. Logging out falls back
 * to the published data. If the refetch fails or `pick` finds
 * nothing, the published data stands. Pass a module-level `pick`, so
 * it's stable across renders.
 */
export function useAdminRefetch<T>(
  initial: T,
  url: string,
  pick: (data: unknown) => T | undefined
) {
  const [adminData, setAdminData] = useState<T>()
  const isAdmin = useIsAdmin()

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false

    fetch(url)
      .then((res) => res.json())
      .then((json: unknown) => {
        const picked = pick(json)
        if (!cancelled && picked !== undefined) setAdminData(picked)
      })
      .catch(() => {
        // published data stands
      })

    return () => {
      cancelled = true
      setAdminData(undefined)
    }
  }, [isAdmin, url, pick])

  return isAdmin && adminData !== undefined ? adminData : initial
}
