'use client'

import { useEffect } from 'react'

import { syncIsAdmin } from '@/ui/useIsAdmin'

/** Hands a server-read session to client `useIsAdmin` callers */
export function IsAdminSync({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    syncIsAdmin(isAdmin)
  }, [isAdmin])

  return null
}
