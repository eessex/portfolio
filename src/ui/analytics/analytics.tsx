'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'

import {
  isAuthedPath,
  isLinkPath,
  isUnauthedPath
} from '@/lib/auth/paths'

// admin-only pages aren't site traffic
export function beforeSend<T extends { url: string }>(event: T) {
  const { pathname } = new URL(event.url)
  return isAuthedPath(pathname) ||
    isUnauthedPath(pathname) ||
    isLinkPath(pathname)
    ? null
    : event
}

export function Analytics() {
  return <VercelAnalytics beforeSend={beforeSend} />
}

export function SpeedInsights() {
  return <VercelSpeedInsights beforeSend={beforeSend} />
}
