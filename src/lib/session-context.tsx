'use client'

import type { Session } from 'next-auth'
import { createContext, useContext } from 'react'

type SessionContextType = {
  session: Session | null
  isLoggedIn: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const useSessionContext = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }
  return context
}

export const SessionProvider = ({
  children,
  session
}: {
  children: React.ReactNode
  session: Session | null
}) => {
  const isLoggedIn = !!session?.user
  return (
    <SessionContext.Provider value={{ session, isLoggedIn }}>
      {children}
    </SessionContext.Provider>
  )
}
