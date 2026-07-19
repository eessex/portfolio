import { renderHook, waitFor } from '@testing-library/react'

import { resetIsAdminCache, useIsAdmin } from '@/ui/useIsAdmin'

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
})
