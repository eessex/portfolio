import { act, renderHook, waitFor } from '@testing-library/react'

import {
  resetIsAdminCache,
  syncIsAdmin,
  useIsAdmin,
  useSyncedIsAdmin
} from '@/ui/use-is-admin'

function mockSession(isAuthed: boolean) {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ isAuthed })
  } as Response)
}

describe('useIsAdmin', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetIsAdminCache()
  })

  it('resolves true for an admin session', async () => {
    mockSession(true)

    const { result } = renderHook(() => useIsAdmin())

    expect(result.current).toBe(false)
    await waitFor(() => expect(result.current).toBe(true))
    expect(global.fetch).toHaveBeenCalledWith('/api/session')
  })

  it('stays false for an anonymous visitor', async () => {
    mockSession(false)

    const { result } = renderHook(() => useIsAdmin())

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(result.current).toBe(false)
  })

  it('shares one session request across callers', async () => {
    mockSession(true)

    const first = renderHook(() => useIsAdmin())
    const second = renderHook(() => useIsAdmin())

    await waitFor(() => expect(first.result.current).toBe(true))
    await waitFor(() => expect(second.result.current).toBe(true))
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('does not fetch when disabled', () => {
    mockSession(true)

    const { result } = renderHook(() => useIsAdmin(false))

    expect(result.current).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('stays false and allows a retry when the request fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useIsAdmin())

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(result.current).toBe(false)

    mockSession(true)
    const retry = renderHook(() => useIsAdmin())
    await waitFor(() => expect(retry.result.current).toBe(true))
  })

  it('follows a sync after login and logout', async () => {
    mockSession(false)

    const { result } = renderHook(() => useIsAdmin())
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(result.current).toBe(false)

    act(() => syncIsAdmin(true))
    expect(result.current).toBe(true)

    act(() => syncIsAdmin(false))
    expect(result.current).toBe(false)
  })

  it('serves a synced answer to later callers without a request', async () => {
    syncIsAdmin(true)

    const { result } = renderHook(() => useIsAdmin())

    await waitFor(() => expect(result.current).toBe(true))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('ignores a session response that a sync supersedes', async () => {
    let resolveSession: (value: Response) => void = () => {}
    global.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveSession = resolve
        })
    )

    const { result } = renderHook(() => useIsAdmin())
    act(() => syncIsAdmin(true))
    await act(async () =>
      resolveSession({
        json: async () => ({ isAuthed: false })
      } as Response)
    )

    expect(result.current).toBe(true)
  })

  it('ignores a sync while disabled', () => {
    const { result } = renderHook(() => useIsAdmin(false))

    act(() => syncIsAdmin(true))

    expect(result.current).toBe(false)
  })
})

describe('useSyncedIsAdmin', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    resetIsAdminCache()
  })

  it('is false without fetching the session', () => {
    const { result } = renderHook(() => useSyncedIsAdmin())

    expect(result.current).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('follows a sync after login and logout', () => {
    const { result } = renderHook(() => useSyncedIsAdmin())

    act(() => syncIsAdmin(true))
    expect(result.current).toBe(true)

    act(() => syncIsAdmin(false))
    expect(result.current).toBe(false)
  })

  it('serves an earlier sync to a later caller', () => {
    syncIsAdmin(true)

    const { result } = renderHook(() => useSyncedIsAdmin())

    expect(result.current).toBe(true)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
