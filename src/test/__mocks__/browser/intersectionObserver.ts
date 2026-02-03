type ObserverRecord = {
  callback: IntersectionObserverCallback
  instance: IntersectionObserver
}

let observers: ObserverRecord[] = []

export function installIntersectionObserverMock () {
  class MockIntersectionObserver {
    callback: IntersectionObserverCallback
    root = null
    rootMargin = ''
    thresholds = []

    observe = jest.fn()
    unobserve = jest.fn()
    disconnect = jest.fn()
    takeRecords = jest.fn()

    constructor (callback: IntersectionObserverCallback) {
      this.callback = callback
      observers.push({
        callback,
        instance: this as unknown as IntersectionObserver
      })
    }
  }

  // @ts-expect-error jsdom doesn't provide IntersectionObserver
  global.IntersectionObserver = MockIntersectionObserver
}

export function triggerIntersection (
  entries: Partial<IntersectionObserverEntry>[] = [{ isIntersecting: true }]
) {
  for (const {
    callback, instance
  } of observers) {
    callback(
      entries as IntersectionObserverEntry[],
      instance
    )
  }
}

export function resetIntersectionObservers () {
  observers = []
}
