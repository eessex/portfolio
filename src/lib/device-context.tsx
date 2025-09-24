'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

type DeviceContextType = {
  isMobile: boolean
  isSmBreakpoint: boolean
}

const DeviceContext = createContext<DeviceContextType>({
  isMobile: false,
  isSmBreakpoint: false
})

export const useDevice = () => useContext(DeviceContext)

export function DeviceProvider ({
  initialIsMobile,
  children
}: {
  initialIsMobile: boolean
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(initialIsMobile)
  const [isSmBreakpoint, setIsSmBreakpoint] = useState(initialIsMobile)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const smQuery = window.matchMedia('(max-width: 920px)')

    const update = () => {
      setIsMobile(mobileQuery.matches)
      setIsSmBreakpoint(smQuery.matches)
    }

    update()

    mobileQuery.addEventListener('change', update)
    smQuery.addEventListener('change', update)

    return () => {
      mobileQuery.removeEventListener('change', update)
      smQuery.removeEventListener('change', update)
    }
  }, [])

  return (
    <DeviceContext.Provider value={{
      isMobile,
      isSmBreakpoint
    }}
    >
      {children}
    </DeviceContext.Provider>
  )
}
