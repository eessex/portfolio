import '@testing-library/jest-dom'

import fetchMock from 'jest-fetch-mock'

import { installAbortControllerMock } from '@/test/__mocks__/browser/abortController'
import { installIntersectionObserverMock } from '@/test/__mocks__/browser/intersectionObserver'

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

installAbortControllerMock()
installIntersectionObserverMock()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
})
