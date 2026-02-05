import '@testing-library/jest-dom'

import fetchMock from 'jest-fetch-mock'

import { installAbortControllerMock } from '@/test/__mocks__/browser/abortController'
import { installIntersectionObserverMock } from '@/test/__mocks__/browser/intersectionObserver'

fetchMock.enableMocks()

installAbortControllerMock()
installIntersectionObserverMock()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
})
