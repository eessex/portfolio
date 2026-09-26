import { act, renderHook, waitFor } from '@testing-library/react'

import {
  venueFixtureAlpha,
  venueFixtureBeta,
  venueFixtureGamma
} from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/schemas/db'
import {
  getAbortControllers,
  resetAbortControllers
} from '@/test/__mocks__/browser/abortController'
import {
  resetIntersectionObservers,
  triggerIntersection
} from '@/test/__mocks__/browser/intersectionObserver'
import { useResultsList } from '@/ui/useResultsList'

function makeResponse(
  res: Venue[],
  overrides: Partial<{
    nextCursor: string | null
    totalCount: number
  }> = {}
) {
  return {
    res,
    nextCursor: overrides.nextCursor ?? null,
    totalCount: overrides.totalCount ?? res.length
  }
}

const defaultVenues: Venue[] = [venueFixtureAlpha, venueFixtureBeta]

function setup(
  options: Partial<{
    initialVenues: Venue[]
    nextCursor: string | null
    totalCount: number
    apiEndpoint: string
    defaultQuery?: string
  }> = {}
) {
  const {
    initialVenues = defaultVenues,
    nextCursor = null,
    totalCount = initialVenues.length,
    apiEndpoint = '/api/venues',
    defaultQuery
  } = options

  const initialResponse = makeResponse(initialVenues, {
    nextCursor,
    totalCount
  })

  const hook = renderHook(() =>
    useResultsList<Venue>(apiEndpoint, initialResponse, {
      defaultQuery
    })
  )

  return {
    ...hook,
    initialVenues,
    apiEndpoint
  }
}

function mockFetchOnce(data: unknown) {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ json: async () => data } as Response)
}

describe('useResultsList', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
    resetAbortControllers()
    resetIntersectionObservers()
  })

  describe('initialization', () => {
    it('initializes items, count, nextCursor, and loading state from initial data', () => {
      const { result, initialVenues } = setup({
        nextCursor: 'cursor-1',
        totalCount: 10
      })

      expect(result.current.items).toEqual(initialVenues)
      expect(result.current.count).toBe(10)
      expect(result.current.totalCount).toBe(10)
      expect(result.current.nextCursor).toBe('cursor-1')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.query).toBe('')
      expect(result.current.sortDirection).toBe('desc')
    })

    it('initializes query from defaultQuery parameter', () => {
      const { result } = setup({ defaultQuery: 'austin' })

      expect(result.current.query).toBe('austin')
    })
  })

  describe('fetching pages', () => {
    it('fetches the next page and appends new items', async () => {
      const nextPageVenues = [venueFixtureGamma]

      mockFetchOnce({
        res: nextPageVenues,
        nextCursor: null,
        totalCount: 3
      })

      const { result, initialVenues } = setup({
        nextCursor: 'cursor-1'
      })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      expect(result.current.items).toEqual([
        ...initialVenues,
        ...nextPageVenues
      ])

      expect(result.current.nextCursor).toBeNull()
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('does not fetch when nextCursor is null', async () => {
      const { result } = setup({ nextCursor: null })

      await act(async () => {
        await result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      expect(global.fetch).not.toHaveBeenCalled()
      expect(result.current.items).toHaveLength(
        result.current.items.length
      )
      expect(result.current.nextCursor).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('prevents duplicate fetches while a request is in flight', async () => {
      let resolveFetch!: (value: unknown) => void

      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          })
      )

      const { result } = setup({ nextCursor: 'cursor-1' })

      // Attach observer
      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      // Second intersection while fetch is in-flight
      act(() => {
        triggerIntersection()
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Resolve fetch to clean up
      await act(async () => {
        resolveFetch({
          json: async () => ({
            res: [],
            nextCursor: null,
            totalCount: 2
          })
        })
      })
    })
  })

  describe('search and filtering', () => {
    it('filters items when query changes', async () => {
      global.fetch = jest.fn()

      const { result } = setup({
        initialVenues: [venueFixtureAlpha, venueFixtureBeta]
      })

      expect(result.current.items).toHaveLength(2)

      await act(async () => {
        result.current.setQuery('austin')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('fetches additional pages when a query is active and more pages exist', async () => {
      const nextPageVenues = [venueFixtureGamma]

      mockFetchOnce({
        res: nextPageVenues,
        nextCursor: null,
        totalCount: 3
      })

      const { result } = setup({ nextCursor: 'cursor-1' })

      await act(async () => {
        result.current.setQuery('chicago')
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(result.current.items).toEqual(nextPageVenues)
      })
    })
  })

  describe('sorting', () => {
    it('reverses item order when sortDirection changes', async () => {
      const { result, initialVenues } = setup({
        initialVenues: [venueFixtureAlpha, venueFixtureBeta]
      })

      // Default sortDirection
      expect(result.current.sortDirection).toBe('desc')
      expect(result.current.items).toEqual(initialVenues)

      await act(async () => {
        result.current.setSortDirection('asc')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([
          venueFixtureBeta,
          venueFixtureAlpha
        ])
      })
    })
  })

  describe('item mutations', () => {
    it('removes an item and updates items and count', () => {
      const { result } = setup()

      const initialCount = result.current.count

      act(() => {
        result.current.onRemoveItem(venueFixtureAlpha.id)
      })

      expect(result.current.items).toEqual([venueFixtureBeta])
      expect(result.current.count).toBe(initialCount - 1)
    })
  })

  describe('fetch lifecycle', () => {
    it('sets isLoading true during fetch and false when complete', async () => {
      let resolveFetch!: (value: unknown) => void

      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          })
      )

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveFetch({
          json: async () => ({
            res: [],
            nextCursor: null,
            totalCount: 2
          })
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('deduplicates items returned by the API', async () => {
      const duplicateAndNew = [
        venueFixtureBeta, // duplicate
        venueFixtureGamma // new
      ]

      mockFetchOnce({
        res: duplicateAndNew,
        nextCursor: null,
        totalCount: 3
      })

      const { result, initialVenues } = setup({
        nextCursor: 'cursor-1'
      })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      expect(result.current.items).toEqual([
        ...initialVenues,
        venueFixtureGamma
      ])
    })
  })

  describe('query and sort effects', () => {
    it('does not refetch on initial mount', () => {
      global.fetch = jest.fn()

      setup({ nextCursor: 'cursor-1' })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('filters locally when no more pages exist', async () => {
      global.fetch = jest.fn()

      const { result } = setup({ nextCursor: null })

      await act(async () => {
        result.current.setQuery('austin')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('mount fetch when no server data', () => {
    it('fetches the first page on mount when initial is omitted', async () => {
      mockFetchOnce(makeResponse(defaultVenues))

      const { result } = renderHook(() =>
        useResultsList<Venue>('/api/venues')
      )

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/venues'),
        expect.anything()
      )
    })

    it('does not fetch on mount when server data is provided', () => {
      global.fetch = jest.fn()

      renderHook(() =>
        useResultsList<Venue>('/api/venues', makeResponse([]))
      )

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('retries via ensureFirstPage when the mount fetch was aborted', async () => {
      const abortError = new DOMException('Aborted', 'AbortError')
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(abortError)
        .mockResolvedValueOnce({
          json: async () => makeResponse(defaultVenues)
        } as Response)

      const { result } = renderHook(() =>
        useResultsList<Venue>('/api/venues')
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.items).toEqual([])

      act(() => {
        result.current.ensureFirstPage()
      })

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('refetches the first page when a StrictMode remount aborts the mount fetch', async () => {
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({
          json: async () => makeResponse(defaultVenues)
        } as Response)

      const { result } = renderHook(
        () => useResultsList<Venue>('/api/venues'),
        { reactStrictMode: true }
      )

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })

      expect(
        getAbortControllers().some((c) => c.abort.mock.calls.length)
      ).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(result.current.isLoading).toBe(false)
    })

    it('does not refetch via ensureFirstPage once the first page has loaded', async () => {
      mockFetchOnce(makeResponse(defaultVenues))

      const { result } = renderHook(() =>
        useResultsList<Venue>('/api/venues')
      )

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })

      act(() => {
        result.current.ensureFirstPage()
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('performance and cleanup', () => {
    it('aborts in-flight requests on unmount', () => {
      global.fetch = jest.fn(() => new Promise(() => {}))

      const { result, unmount } = setup({ nextCursor: 'cursor-1' })

      resetAbortControllers()

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      unmount()

      const controllers = getAbortControllers()
      expect(controllers).toHaveLength(1)
      expect(controllers[0].abort).toHaveBeenCalled()
    })

    it.skip('reuses cached search text between searches', async () => {
      const { result } = setup()

      await act(async () => {
        result.current.setQuery('austin')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })

      // (should hit cache)
      await act(async () => {
        result.current.setQuery('')
        result.current.setQuery('austin')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })

      // // invalidate cached search text
      // act(() => {
      //   result.current.onEditItem(
      //     {
      //       ...venueFixtureAlpha,
      //       city: 'Dallas'
      //     },
      //     {}
      //   )
      // })

      // query should no longer match
      await waitFor(() => {
        expect(result.current.items).toEqual([])
      })
    })
  })

  describe('IntersectionObserver', () => {
    it('loads more items when the observer target intersects', async () => {
      const nextPageVenues = [venueFixtureGamma]

      mockFetchOnce({
        res: nextPageVenues,
        nextCursor: null,
        totalCount: 3
      })

      const { result, initialVenues } = setup({
        nextCursor: 'cursor-1'
      })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })

      act(() => {
        triggerIntersection()
      })

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      expect(result.current.items).toEqual([
        ...initialVenues,
        ...nextPageVenues
      ])

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
