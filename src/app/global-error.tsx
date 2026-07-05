'use client'

import '@/ui/globals.scss'

import { useEffect } from 'react'

import { ErrorMessage } from '@/ui/error-message/error-message'
import { geistMono, geistSans } from '@/ui/fonts'

export default function GlobalError({
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
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorMessage title='Something went wrong' onRetry={reset} />
      </body>
    </html>
  )
}
