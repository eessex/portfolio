import '@testing-library/jest-dom'

import { installAbortControllerMock } from '@/test/__mocks__/browser/abortController'
import { installIntersectionObserverMock } from '@/test/__mocks__/browser/intersectionObserver'

installAbortControllerMock()
installIntersectionObserverMock()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
})
