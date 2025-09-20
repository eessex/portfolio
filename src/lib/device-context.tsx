'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type DeviceContextType = {
  isMobile: boolean
}

const DeviceContext = createContext<DeviceContextType>({ isMobile: false })

export const useDevice = () => useContext(DeviceContext)

export function DeviceProvider ({
  initialIsMobile,
  children
}: {
  initialIsMobile: boolean
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(initialIsMobile)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateIsMobile = () => setIsMobile(mediaQuery.matches)

    updateIsMobile()
    mediaQuery.addEventListener('change', updateIsMobile)
    return () => mediaQuery.removeEventListener('change', updateIsMobile)
  }, [])

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  )
}
