'use client'

import { useEffect } from 'react'

import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { ErrorMessage } from '@/ui/error-message/error-message'

export default function SettingsError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <DashboardLayout title='Something went wrong'>
      <ErrorMessage onRetry={reset} />
    </DashboardLayout>
  )
}
