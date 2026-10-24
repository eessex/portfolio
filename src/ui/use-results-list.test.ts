import { act, renderHook, waitFor } from '@testing-library/react'

import type { PageDataResponse, PageItemClient } from '@/lib/types'
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
import {
  SEARCH_DEBOUNCE_MS,
  useResultsList
} from '@/ui/use-results-list'
import { useIsAdmin } from '@/ui/useIsAdmin'

jest.mock('@/ui/useIsAdmin', () => ({
  useIsAdmin: jest.fn(() => false)
}))

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
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data
  } as Response)
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
          ok: true,
          json: async () => ({
            res: [],
            nextCursor: null,
            totalCount: 2
          })
        })
      })
    })
  })

  describe('server-side search', () => {
    it('refetches the first page for a changed query', async () => {
      mockFetchOnce(makeResponse([venueFixtureAlpha]))

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => {
        result.current.setQuery('austin')
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=austin',
        expect.anything()
      )
      expect(result.current.count).toBe(1)
      expect(result.current.totalCount).toBe(2)
      expect(result.current.nextCursor).toBeNull()
    })

    it('searches even while another page is loading', async () => {
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => makeResponse([venueFixtureAlpha])
        } as Response)

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })
      act(() => {
        triggerIntersection()
      })
      act(() => result.current.setQuery('austin'))

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=austin',
        expect.anything()
      )
      // the load-more fetch, aborted by the search
      expect(getAbortControllers().at(-2)?.abort).toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })

    it('sends only the query typing paused on', async () => {
      mockFetchOnce(makeResponse([venueFixtureAlpha]))

      const { result } = setup()

      act(() => result.current.setQuery('a'))
      act(() => result.current.setQuery('au'))
      act(() => result.current.setQuery('austin'))

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=austin',
        expect.anything()
      )
    })

    it('does not fetch when the query returns to the loaded one', async () => {
      const { result } = setup()

      act(() => result.current.setQuery('a'))
      act(() => result.current.setQuery(''))

      await new Promise((resolve) =>
        setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50)
      )
      expect(global.fetch).not.toHaveBeenCalled()
      expect(result.current.items).toEqual(defaultVenues)
    })

    it('cancels an in-flight search when the query returns to the loaded one', async () => {
      let resolveSearch: (res: Response) => void = () => {}
      global.fetch = jest.fn().mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          resolveSearch = resolve
        })
      )

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => result.current.setQuery('ab'))
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)

      act(() => result.current.setQuery(''))
      expect(getAbortControllers().at(-1)?.abort).toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        resolveSearch({
          ok: true,
          json: async () => makeResponse([venueFixtureAlpha])
        } as Response)
      })
      expect(result.current.items).toEqual(defaultVenues)
      expect(result.current.resultsQuery).toBe('')
      expect(result.current.nextCursor).toBe('cursor-1')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('keeps the loaded query’s results and cursor when a search fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new SyntaxError('Unexpected token <')
        }
      } as unknown as Response)

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => result.current.setQuery('austin'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.items).toEqual(defaultVenues)
      expect(result.current.resultsQuery).toBe('')

      // loading more continues the shown (unsearched) results
      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })
      act(() => triggerIntersection())
      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          '/api/venues?query=&cursor=cursor-1',
          expect.anything()
        )
      })
    })

    it('retries a failed search via ensureFirstPage', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => makeResponse([venueFixtureAlpha])
        } as Response)

      const { result } = setup()

      act(() => result.current.setQuery('austin'))
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(false)
      })

      act(() => result.current.ensureFirstPage())

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureAlpha])
      })
      expect(result.current.resultsQuery).toBe('austin')
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=austin',
        expect.anything()
      )
    })

    it('continues the searched query’s cursor when loading more', async () => {
      mockFetchOnce(
        makeResponse([venueFixtureAlpha], {
          nextCursor: 'cursor-austin',
          totalCount: 2
        })
      )

      const { result } = setup({ nextCursor: 'cursor-1' })

      act(() => result.current.setQuery('austin'))
      await waitFor(() => {
        expect(result.current.nextCursor).toBe('cursor-austin')
      })

      mockFetchOnce(makeResponse([venueFixtureGamma]))
      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })
      act(() => {
        triggerIntersection()
      })

      await waitFor(() => {
        expect(result.current.items).toEqual([
          venueFixtureAlpha,
          venueFixtureGamma
        ])
      })
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=austin&cursor=cursor-austin',
        expect.anything()
      )
    })

    it('merges a grouped page into its groups', async () => {
      mockFetchOnce({
        res: { a: [venueFixtureBeta, venueFixtureGamma], b: [] },
        nextCursor: null,
        totalCount: 3
      })

      const { result } = renderHook(() =>
        useResultsList<
          never,
          Venue & PageItemClient,
          PageDataResponse
        >('/api/venues', {
          res: { a: [venueFixtureAlpha, venueFixtureBeta] },
          nextCursor: 'cursor-1',
          totalCount: 3
        } as never)
      )

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })
      act(() => {
        triggerIntersection()
      })

      await waitFor(() => {
        expect(result.current.groupedItems).toEqual({
          a: [venueFixtureAlpha, venueFixtureBeta, venueFixtureGamma],
          b: []
        })
      })
      expect(result.current.items).toEqual([
        venueFixtureAlpha,
        venueFixtureBeta,
        venueFixtureGamma
      ])
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
          ok: true,
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

  describe('query effect', () => {
    it('does not refetch on initial mount', () => {
      global.fetch = jest.fn()

      setup({ nextCursor: 'cursor-1' })

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
          ok: true,
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

    it('refetches the first page after a search that aborted the mount fetch is cancelled', async () => {
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => makeResponse(defaultVenues)
        } as Response)

      const { result } = renderHook(() =>
        useResultsList<Venue>('/api/venues')
      )

      act(() => result.current.setQuery('ab'))
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      act(() => result.current.setQuery(''))

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=',
        expect.anything()
      )
    })

    it('refetches the first page when a StrictMode remount aborts the mount fetch', async () => {
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({
          ok: true,
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
  })

  describe('animated replace', () => {
    let runTransition: () => void

    beforeEach(() => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      window.matchMedia = jest.fn().mockReturnValue({
        matches: false
      }) as typeof window.matchMedia
      // defer the update callback, as the browser does
      document.startViewTransition = jest.fn(
        (callback: () => void) => {
          let resolveDone!: () => void
          const updateCallbackDone = new Promise<void>((resolve) => {
            resolveDone = resolve
          })
          runTransition = () => {
            callback()
            resolveDone()
          }
          return {
            ready: Promise.resolve(),
            finished: updateCallbackDone,
            updateCallbackDone,
            skipTransition: jest.fn()
          }
        }
      ) as unknown as typeof document.startViewTransition
    })

    afterEach(() => {
      jest.mocked(useIsAdmin).mockReturnValue(false)
      // @ts-expect-error jsdom doesn't provide startViewTransition
      delete document.startViewTransition
    })

    it('holds the fetch guard until the transition applies, then loads the new cursor', async () => {
      mockFetchOnce(
        makeResponse(defaultVenues, {
          nextCursor: 'cursor-new',
          totalCount: 3
        })
      )

      const { result } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues, {
            nextCursor: 'cursor-old',
            totalCount: 3
          }),
          { augmentOnMount: true }
        )
      )

      await waitFor(() => {
        expect(document.startViewTransition).toHaveBeenCalled()
      })

      act(() => {
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      })
      act(() => {
        triggerIntersection()
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        runTransition()
      })

      expect(result.current.nextCursor).toBe('cursor-new')
      expect(result.current.isLoading).toBe(false)

      mockFetchOnce(
        makeResponse([venueFixtureGamma], { totalCount: 3 })
      )
      resetIntersectionObservers()
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
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=&cursor=cursor-new',
        expect.anything()
      )
    })
    it('drops a deferred update superseded by a logout refetch', async () => {
      mockFetchOnce(
        makeResponse([...defaultVenues, venueFixtureGamma], {
          nextCursor: 'cursor-admin'
        })
      )

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      await waitFor(() => {
        expect(document.startViewTransition).toHaveBeenCalled()
      })

      jest.mocked(useIsAdmin).mockReturnValue(false)
      mockFetchOnce(makeResponse(defaultVenues))
      rerender()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        runTransition()
      })

      expect(result.current.items).toEqual(defaultVenues)
      expect(result.current.nextCursor).toBeNull()
    })
  })

  describe('admin augment', () => {
    afterEach(() => {
      jest.mocked(useIsAdmin).mockReturnValue(false)
    })

    it('refetches the published first page on logout', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      mockFetchOnce(
        makeResponse([...defaultVenues, venueFixtureGamma])
      )

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      jest.mocked(useIsAdmin).mockReturnValue(false)
      mockFetchOnce(makeResponse(defaultVenues))
      rerender()

      await waitFor(() => {
        expect(result.current.items).toEqual(defaultVenues)
      })
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=',
        expect.anything()
      )
    })

    it('clears drafts on logout even if the refetch fails', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      mockFetchOnce(
        makeResponse([...defaultVenues, venueFixtureGamma], {
          nextCursor: 'cursor-1'
        })
      )
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      jest.mocked(useIsAdmin).mockReturnValue(false)
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response)
      rerender()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.items).toEqual(defaultVenues)
      expect(result.current.nextCursor).toBeNull()
    })

    it('clears drafts a later page appended after the admin refresh failed', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      jest.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response)

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues, { nextCursor: 'cursor-1' }),
          { augmentOnMount: true }
        )
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      mockFetchOnce(makeResponse([venueFixtureGamma]))
      act(() =>
        result.current.loadMoreRef(
          document.createElement('li') as HTMLLIElement
        )
      )
      act(() => triggerIntersection())
      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })

      jest.mocked(useIsAdmin).mockReturnValue(false)
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response)
      rerender()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.items).toEqual(defaultVenues)
    })

    it('refetches a search cleared by logout when returning to it mid-search', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      global.fetch = jest.fn((url: string) =>
        url.includes('query=b')
          ? new Promise<Response>(() => {})
          : Promise.resolve({
              ok: true,
              json: async () =>
                makeResponse(
                  url.includes('query=austin')
                    ? [venueFixtureGamma]
                    : defaultVenues
                )
            } as Response)
      ) as jest.Mock

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )
      act(() => result.current.setQuery('austin'))
      await waitFor(() => {
        expect(result.current.resultsQuery).toBe('austin')
      })

      act(() => result.current.setQuery('b'))
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/venues?query=b',
          expect.anything()
        )
      })
      jest.mocked(useIsAdmin).mockReturnValue(false)
      rerender()
      expect(result.current.items).toEqual([])

      jest.mocked(global.fetch).mockClear()
      act(() => result.current.setQuery('austin'))

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureGamma])
      })
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=austin',
        expect.anything()
      )
    })

    it('empties a searched list of drafts on logout if the refetch fails', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      mockFetchOnce(makeResponse([venueFixtureGamma]))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true, defaultQuery: 'g' }
        )
      )

      await waitFor(() => {
        expect(result.current.items).toEqual([venueFixtureGamma])
      })
      act(() => result.current.setQuery('x'))
      mockFetchOnce(
        makeResponse([venueFixtureGamma], { nextCursor: 'cursor-1' })
      )
      await waitFor(() => {
        expect(result.current.resultsQuery).toBe('x')
      })

      jest.mocked(useIsAdmin).mockReturnValue(false)
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response)
      rerender()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.items).toEqual([])
      expect(result.current.nextCursor).toBeNull()
    })

    it('refetches the loaded query when returning to it cancels the admin refresh', async () => {
      const augmented = makeResponse([
        ...defaultVenues,
        venueFixtureGamma
      ])
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise<Response>(() => {}))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => augmented
        } as Response)

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      // the session resolves as admin while a query is typed
      act(() => result.current.setQuery('a'))
      jest.mocked(useIsAdmin).mockReturnValue(true)
      rerender()
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=a',
        expect.anything()
      )

      act(() => result.current.setQuery(''))
      const refreshSignal = jest.mocked(global.fetch).mock
        .calls[0]![1]!.signal
      expect(
        getAbortControllers().find((c) => c.signal === refreshSignal)
          ?.abort
      ).toHaveBeenCalled()

      await waitFor(() => {
        expect(result.current.items).toEqual(augmented.res)
      })
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=',
        expect.anything()
      )
    })

    it('refetches the loaded query when returning to it after a failed search aborted the admin refresh', async () => {
      const augmented = makeResponse([
        ...defaultVenues,
        venueFixtureGamma
      ])
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise<Response>(() => {}))
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => augmented
        } as Response)
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result, rerender } = renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      jest.mocked(useIsAdmin).mockReturnValue(true)
      rerender()
      act(() => result.current.setQuery('a'))
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => result.current.setQuery(''))

      await waitFor(() => {
        expect(result.current.items).toEqual(augmented.res)
      })
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/venues?query=',
        expect.anything()
      )
    })

    it('does not refetch for an anonymous visitor', () => {
      renderHook(() =>
        useResultsList<Venue>(
          '/api/venues',
          makeResponse(defaultVenues),
          { augmentOnMount: true }
        )
      )

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('IntersectionObserver', () => {
    const sentinel = document.createElement('li') as HTMLLIElement

    function interruptLoadMore(search: Promise<unknown>) {
      global.fetch = jest
        .fn()
        .mockReturnValueOnce(new Promise<Response>(() => {}))
        .mockReturnValueOnce(search)
      const hook = setup({ nextCursor: 'cursor-1' })
      act(() => hook.result.current.loadMoreRef(sentinel))
      act(() => triggerIntersection())
      act(() => hook.result.current.setQuery('a'))
      return hook
    }

    it('ignores a stale observer callback after a search replaces the results', async () => {
      const { result } = setup({ nextCursor: 'cursor-1' })
      act(() => result.current.loadMoreRef(sentinel))

      mockFetchOnce(
        makeResponse([venueFixtureGamma], {
          nextCursor: 'cursor-austin'
        })
      )
      act(() => result.current.setQuery('austin'))
      await waitFor(() => {
        expect(result.current.resultsQuery).toBe('austin')
      })

      act(() => triggerIntersection())

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(result.current.items).toEqual([venueFixtureGamma])
    })

    it('re-arms pagination when a search that interrupted load-more is cancelled', async () => {
      const { result } = interruptLoadMore(new Promise(() => {}))
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
      const { loadMoreRef } = result.current

      act(() => result.current.setQuery(''))

      expect(result.current.loadMoreRef).not.toBe(loadMoreRef)
      // as React does for a changed ref callback
      act(() => result.current.loadMoreRef(sentinel))
      mockFetchOnce(makeResponse([venueFixtureGamma]))
      act(() => triggerIntersection())
      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=&cursor=cursor-1',
        expect.anything()
      )
    })

    it('re-arms pagination when a search that interrupted load-more keeps the same cursor', async () => {
      const { result } = interruptLoadMore(
        Promise.resolve({
          ok: true,
          json: async () =>
            makeResponse([venueFixtureAlpha], {
              nextCursor: 'cursor-1'
            })
        } as Response)
      )
      const { loadMoreRef } = result.current

      await waitFor(() => {
        expect(result.current.resultsQuery).toBe('a')
      })

      expect(result.current.nextCursor).toBe('cursor-1')
      expect(result.current.loadMoreRef).not.toBe(loadMoreRef)
    })

    it('re-arms pagination when a search that interrupted load-more fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = interruptLoadMore(
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        } as Response)
      )
      const { loadMoreRef } = result.current

      await waitFor(() => {
        expect(result.current.loadMoreRef).not.toBe(loadMoreRef)
      })
      expect(result.current.resultsQuery).toBe('')

      act(() => result.current.loadMoreRef(sentinel))
      mockFetchOnce(makeResponse([venueFixtureGamma]))
      act(() => triggerIntersection())
      await waitFor(() => {
        expect(result.current.items).toHaveLength(3)
      })
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues?query=&cursor=cursor-1',
        expect.anything()
      )
    })

    it('does not re-arm pagination after a later page fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response)
      const { result } = setup({ nextCursor: 'cursor-1' })
      act(() => result.current.loadMoreRef(sentinel))
      act(() => triggerIntersection())
      // a second notification while in flight marks paging stalled
      act(() => triggerIntersection())
      const { loadMoreRef } = result.current

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.loadMoreRef).toBe(loadMoreRef)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

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
