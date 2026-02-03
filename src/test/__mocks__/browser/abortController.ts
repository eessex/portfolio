type AbortControllerRecord = {
  abort: jest.Mock
  signal: AbortSignal
}

let controllers: AbortControllerRecord[] = []

export function installAbortControllerMock () {
  class MockAbortController {
    abort = jest.fn()
    signal = {} as AbortSignal

    constructor () {
      controllers.push({
        abort: this.abort,
        signal: this.signal
      })
    }
  }

  global.AbortController = MockAbortController
}

export function getAbortControllers () {
  return controllers
}

export function resetAbortControllers () {
  controllers = []
}
