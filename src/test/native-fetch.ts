/**
 * Captures Node's native fetch classes before jest-fetch-mock swaps
 * in cross-fetch's (which lack `Response.json`, used by NextResponse).
 * Must be imported before jest-fetch-mock.
 */
const native = {
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response
}

export function restoreNativeFetchClasses() {
  Object.assign(globalThis, native)
}
