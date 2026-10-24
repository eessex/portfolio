import { renderHook, waitFor } from '@testing-library/react'

import { useAdminRefetch } from '@/ui/use-admin-refetch'
import { useIsAdmin } from '@/ui/useIsAdmin'

jest.mock('@/ui/useIsAdmin', () => ({
  useIsAdmin: jest.fn(() => false)
}))

const published = ['published']
const withDrafts = ['published', 'draft']

function pickItems(data: unknown) {
  return (data as { res?: string[] }).res
}

function mockFetch(data: unknown) {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ json: async () => data } as Response)
}

function setup() {
  return renderHook(() =>
    useAdminRefetch(published, '/api/items', pickItems)
  )
}

describe('useAdminRefetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.mocked(useIsAdmin).mockReturnValue(false)
  })

  it('keeps the published data for anonymous visitors', () => {
    const { result } = setup()

    expect(result.current).toBe(published)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('replaces the published data with the refetch for admins', async () => {
    jest.mocked(useIsAdmin).mockReturnValue(true)
    mockFetch({ res: withDrafts })

    const { result } = setup()

    await waitFor(() => {
      expect(result.current).toEqual(withDrafts)
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/items')
  })

  it('keeps the published data when the refetch fails', async () => {
    jest.mocked(useIsAdmin).mockReturnValue(true)
    global.fetch = jest.fn().mockRejectedValue(new Error('down'))

    const { result } = setup()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(result.current).toBe(published)
  })

  it('falls back to the published data on logout', async () => {
    jest.mocked(useIsAdmin).mockReturnValue(true)
    mockFetch({ res: withDrafts })

    const { result, rerender } = setup()
    await waitFor(() => {
      expect(result.current).toEqual(withDrafts)
    })

    jest.mocked(useIsAdmin).mockReturnValue(false)
    rerender()

    expect(result.current).toBe(published)
  })

  it('refetches when logging in again', async () => {
    jest.mocked(useIsAdmin).mockReturnValue(true)
    mockFetch({ res: withDrafts })
    const { result, rerender } = setup()
    await waitFor(() => {
      expect(result.current).toEqual(withDrafts)
    })

    jest.mocked(useIsAdmin).mockReturnValue(false)
    rerender()
    jest.mocked(useIsAdmin).mockReturnValue(true)
    rerender()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('drops the previous session’s data when the next login refetch fails', async () => {
    jest.mocked(useIsAdmin).mockReturnValue(true)
    mockFetch({ res: withDrafts })
    const { result, rerender } = setup()
    await waitFor(() => {
      expect(result.current).toEqual(withDrafts)
    })

    jest.mocked(useIsAdmin).mockReturnValue(false)
    rerender()
    global.fetch = jest.fn().mockRejectedValue(new Error('down'))
    jest.mocked(useIsAdmin).mockReturnValue(true)
    rerender()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(result.current).toBe(published)
  })
})
