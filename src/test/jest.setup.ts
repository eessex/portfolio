import '@testing-library/jest-dom'
import '@/test/native-fetch'

import fetchMock from 'jest-fetch-mock'

import { installAbortControllerMock } from '@/test/__mocks__/browser/abortController'
import { installDialogMock } from '@/test/__mocks__/browser/dialog'
import { installIntersectionObserverMock } from '@/test/__mocks__/browser/intersectionObserver'
import { restoreNativeFetchClasses } from '@/test/native-fetch'

fetchMock.enableMocks()

// Server actions verify the session via @/auth (see
// src/lib/auth/guard.ts); mock it as authed by default so action
// tests exercise the underlying logic. Tests simulating an
// unauthenticated caller can override auth's resolved value.
jest.mock('@/auth', () => ({
  auth: jest.fn(async () => ({
    user: { name: 'Test User', email: 'test@example.com' }
  })),
  handlers: {},
  signIn: jest.fn(),
  signOut: jest.fn()
}))

// The guard reads both to find the session cookie (see
// currentSession in src/lib/auth/guard.ts)
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
  cookies: jest.fn(async () => ({ toString: () => '' }))
}))

// outside a request, connection() has no scope to defer to
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  connection: jest.fn(async () => {})
}))

// ESM-only packages Jest can't parse
jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }))
jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null
}))

installAbortControllerMock()

// Route handler tests run in the node environment (no DOM) and
// need native Response for NextResponse.json
if (typeof window === 'undefined') {
  restoreNativeFetchClasses()
} else {
  installDialogMock()
  installIntersectionObserverMock()

  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: jest.fn(),
    writable: true
  })
}
