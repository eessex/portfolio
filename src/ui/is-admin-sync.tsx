'use client'

import { useEffect } from 'react'

import { syncIsAdmin } from '@/ui/use-is-admin'

/** Hands a server-read session to client `useIsAdmin` callers */
export function IsAdminSync({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    syncIsAdmin(isAdmin)
  }, [isAdmin])

  return null
}
