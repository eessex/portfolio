'use client'

import { useEffect } from 'react'

import { ErrorMessage } from '@/ui/error-message/error-message'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorMessage title='Something went wrong' onRetry={reset} />
}
