import { headers } from 'next/headers'

import { DeviceProvider } from '@/lib/device-context'

export async function DeviceLayout({
  children
}: {
  children: React.ReactNode
}) {
  const reqHeaders = await headers()
  const userAgent = reqHeaders.get('user-agent') ?? ''
  const isMobileUA = /Mobile|Android|iPhone|iPad|iPod/i.test(
    userAgent
  )

  return (
    <DeviceProvider initialIsMobile={isMobileUA}>
      {children}
    </DeviceProvider>
  )
}
