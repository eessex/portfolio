'use client'

import {
  Analytics as VercelAnalytics,
  type BeforeSendEvent
} from '@vercel/analytics/next'

import { isAuthedPath, isUnauthedPath } from '@/lib/auth/paths'

// admin-only pages aren't site traffic
export function beforeSend(event: BeforeSendEvent) {
  const { pathname } = new URL(event.url)
  return isAuthedPath(pathname) || isUnauthedPath(pathname)
    ? null
    : event
}

export function Analytics() {
  return <VercelAnalytics beforeSend={beforeSend} />
}
