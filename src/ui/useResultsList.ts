import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import type { ResponseWithCursor } from '@/lib/util'
import type { DashboardItem } from '@/ui/dashboard/dashboard-items'

type SortDirection = 'asc' | 'desc'

/**
 * Fetch paginated results with infinite scroll, search, and sort.
 */
export function useResultsList<T extends DashboardItem> (
  apiEndpoint: string,
  initial: ResponseWithCursor<T>
) {
  /** User search query */
  const [query, setQuery] = useState<string>('')
  const queryRef = useRef(query)

  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const sortDirectionRef = useRef(sortDirection)

  const [isLoading, setIsLoading] = useState(false)
  /** Current list of items (filtered and sorted) */
  const [items, setItems] = useState<T[]>(initial.res)
  /** Cursor for next page */
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor)
  /** Count of filtered results */
  const [count, setCount] = useState(initial.totalCount)

  /** Total count from the server (unfiltered) */
  const totalCount = initial.totalCount
  /** A ref to the "load more" element for infinite scrolling, provided by consumer */
  const loadMoreRef = useRef<HTMLLIElement>(null)
  /** Prevent refetch on rehydration */
  const isMounted = useRef(true)
  /** Abort controller for fetch requests */
  const abortControllerRef = useRef<AbortController | null>(null)
  /** Cache: full unfiltered results */
  const fullResultsCache = useRef<T[]>(initial.res)
  /** Fetching state ref to prevent duplicate requests */
  const isFetchingRef = useRef(false)
  /** Cache: one item's normalized search text */
  const searchIndexRef = useRef<WeakMap<T, string>>(new WeakMap())

  useEffect(() => {
    queryRef.current = query
    sortDirectionRef.current = sortDirection
  }, [query, sortDirection])

  const buildUrl = useCallback(
    (cursor?: string, searchQuery?: string) => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('query', searchQuery)
      if (cursor) params.set('cursor', cursor)
      const queryString = params.toString()
      return queryString ? `${apiEndpoint}?${queryString}` : apiEndpoint
    },
    [apiEndpoint]
  )

  const getSearchText = useCallback(
    (item: T): string => {
      const cached = searchIndexRef.current.get(item)
      if (cached) return cached

      const text = Object.values(item)
        .filter(v => typeof v === 'string')
        .join(', ')
        .toLowerCase()

      searchIndexRef.current.set(item, text)
      return text
    },
    []
  )

  const applyFilter = useCallback(
    (list: T[], q: string, sortDirection: SortDirection) => {
      let filtered = list

      if (q) {
        const formattedQ = q.toLowerCase()
        filtered = list.filter(item => getSearchText(item).includes(formattedQ))
      }

      return sortDirection === 'asc' ? [...filtered].reverse() : filtered
    },
    [getSearchText]
  )

  const fetchPage = useCallback(
    async (options: { cursor?: string, replace?: boolean } = {}) => {
      if (isFetchingRef.current) return

      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      isFetchingRef.current = true
      setIsLoading(true)

      const currentQuery = queryRef.current
      const currentSort = sortDirectionRef.current

      try {
        const res = await fetch(buildUrl(options.cursor, currentQuery), { signal: abortControllerRef.current.signal })
        const data: ResponseWithCursor<T> = await res.json()

        const newItems = options.replace
          ? data.res
          : data.res.filter(newItem => !fullResultsCache.current.some(i => i.id === newItem.id))

        fullResultsCache.current = options.replace
          ? newItems
          : [...fullResultsCache.current, ...newItems]

        setItems(applyFilter(fullResultsCache.current, currentQuery, currentSort))
        setNextCursor(data.nextCursor)
        setCount(data.totalCount)
      } catch (err: Error | unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Fetch page error:', err)
        }
      } finally {
        isFetchingRef.current = false
        setIsLoading(false)
      }
    },
    [applyFilter, buildUrl]
  )

  // Infinite scroll
  const loadMore = useCallback(
    async () => {
      if (!nextCursor || isFetchingRef.current) return
      await fetchPage({ cursor: nextCursor })
    },
    [nextCursor, fetchPage]
  )

  // Infinite scroll observer
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!loadMoreRef.current || !nextCursor) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [loadMore, nextCursor])

  // Handle query or sort change
  useEffect(() => {
    if (isMounted.current) {
      isMounted.current = false
      return
    }

    let cancelled = false
    const fetchOrFilter = async () => {
      // No cached results: fetch first page
      if (!fullResultsCache.current.length) {
        await fetchPage({ replace: true })
        if (cancelled) return
        return
      }

      if (!nextCursor || !query) {
        if (cancelled) return
        setItems(applyFilter(fullResultsCache.current, query, sortDirection))
        return
      }

      // Query active + more pages: fetch next page and filter
      await fetchPage({ cursor: nextCursor })
    }

    fetchOrFilter()

    return () => {
      cancelled = true
    }
  }, [query, sortDirection, fetchPage, applyFilter, nextCursor])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    count,
    isLoading,
    items,
    loadMoreRef,
    query,
    setQuery,
    sortDirection,
    setSortDirection,
    nextCursor,
    totalCount
  }
}
