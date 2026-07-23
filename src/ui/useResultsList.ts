import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient,
  PageItemResponseWithCursor
} from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import { useIsAdmin } from '@/ui/useIsAdmin'
import { buildApiUrl, type SearchParams } from '@/ui/util'

type SortDirection = 'asc' | 'desc'

/** Fields excluded from local search text, e.g. venue.timezone */
const NON_SEARCHABLE_KEYS = new Set(['timezone'])

export type ResultsResponse<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient,
  S extends PageDataResponse | undefined = undefined
> = S extends PageDataResponse
  ? PageItemResponseWithCursor<TPage, S>
  : ResponseWithCursor<TEmbeddedItem>

/**
 * Fetch paginated results with infinite scroll, search, and sort.
 */
export function useResultsList<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient = never,
  S extends PageDataResponse | undefined = undefined
>(
  apiEndpoint: string,
  /**
   * Server-seeded first page. Omit to fetch the first page client-side
   * on mount instead (e.g. the about cover-image picker); pass an empty
   * response to seed an empty, search-only list with no mount fetch.
   */
  initial?: ResultsResponse<TEmbeddedItem, TPage, S>,
  {
    defaultQuery,
    augmentOnMount,
    searchParams
  }: {
    defaultQuery?: string
    augmentOnMount?: boolean
    /**
     * Extra query-string params forwarded to every API fetch, e.g.
     * `{ projectId }` to scope to a parent, or `{ isPress: true }` to
     * restrict images/links to press items.
     */
    searchParams?: SearchParams
  } = {}
) {
  /** User search query */
  const [query, setQuery] = useState<string>(defaultQuery || '')
  const queryRef = useRef(query)

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('desc')
  const sortDirectionRef = useRef(sortDirection)

  const [isLoading, setIsLoading] = useState(false)
  /** Current list of items (filtered and sorted) */
  const [items, setItems] = useState<(TEmbeddedItem | TPage)[]>(
    normalizeItems<TEmbeddedItem | TPage>(initial?.res ?? [])
  )
  /** Cursor for next page */
  const [nextCursor, setNextCursor] = useState<string | null>(
    initial?.nextCursor ?? null
  )
  /** Count of filtered results */
  const [count, setCount] = useState(initial?.totalCount ?? 0)

  /** Total count from the server (unfiltered) */
  const totalCount = initial?.totalCount ?? 0
  /** Prevent refetch on rehydration */
  const isMounted = useRef(true)
  /** Abort controller for fetch requests */
  const abortControllerRef = useRef<AbortController | null>(null)
  /** Cache: full unfiltered results */
  const fullResultsCache = useRef<(TEmbeddedItem | TPage)[]>(
    normalizeItems<TEmbeddedItem | TPage>(initial?.res ?? [])
  )
  /** Fetching state ref to prevent duplicate requests */
  const isFetchingRef = useRef(false)
  /** Set once an initial (replace) fetch completes without aborting */
  const hasLoadedInitialRef = useRef(false)
  /** Cache: one item's normalized search text */
  const searchIndexRef = useRef<Map<string, string>>(new Map())
  const [groupedItems, setGroupedItems] = useState<Record<
    string,
    (TEmbeddedItem | TPage)[]
  > | null>(
    initial && !Array.isArray(initial.res) ? initial.res : null
  )
  const groupedCache = useRef<
    Record<string, (TEmbeddedItem | TPage)[]>
  >(initial && !Array.isArray(initial.res) ? initial.res : {})

  useEffect(() => {
    queryRef.current = query
    sortDirectionRef.current = sortDirection
  }, [query, sortDirection])

  // Compared by value so callers can pass an inline `searchParams`
  // object without destabilizing the memoized `buildUrl`/`fetchPage`.
  const searchParamsKey = JSON.stringify(searchParams ?? {})
  const buildUrl = useCallback(
    (cursor?: string, searchQuery?: string) => {
      return buildApiUrl(apiEndpoint, {
        query: searchQuery,
        cursor,
        ...searchParams
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiEndpoint, searchParamsKey]
  )

  function normalizeItems<T>(res: T[] | Record<string, T[]>): T[] {
    if (Array.isArray(res)) {
      return res
    }

    return Object.values(res).flat()
  }

  const extractStrings = useCallback(function extractStringsInner(
    value: unknown,
    key?: string
  ): string[] {
    if (!value) return []
    if (key && NON_SEARCHABLE_KEYS.has(key)) return []

    if (typeof value === 'string') {
      return [value]
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => extractStringsInner(v))
    }

    if (typeof value === 'object') {
      return Object.entries(value).flatMap(([k, v]) =>
        extractStringsInner(v, k)
      )
    }

    return []
  }, [])

  const getSearchText = useCallback(
    (item: TEmbeddedItem | TPage): string => {
      const cached = searchIndexRef.current.get(item.id)
      if (cached) return cached

      const text = extractStrings(item).join(', ').toLowerCase()

      searchIndexRef.current.set(item.id, text)
      return text
    },
    [extractStrings]
  )

  const applyFilter = useCallback(
    (
      list: (TEmbeddedItem | TPage)[],
      q: string,
      sortDirection: SortDirection
    ) => {
      let filtered = list

      if (q) {
        const formattedQ = q.toLowerCase()
        filtered = list.filter((item) =>
          getSearchText(item).includes(formattedQ)
        )
      }

      return sortDirection === 'asc'
        ? [...filtered].reverse()
        : filtered
    },
    [getSearchText]
  )

  const fetchPage = useCallback(
    async (options: { cursor?: string; replace?: boolean } = {}) => {
      if (isFetchingRef.current) return

      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      isFetchingRef.current = true
      setIsLoading(true)

      const currentQuery = queryRef.current
      const currentSort = sortDirectionRef.current

      try {
        const res = await fetch(
          buildUrl(options.cursor, currentQuery),
          {
            signal: abortControllerRef.current.signal
          }
        )
        const data: ResultsResponse<TEmbeddedItem, TPage, S> =
          await res.json()
        const isGrouped = !Array.isArray(data.res)
        if (isGrouped) {
          const res = data.res as Record<
            string,
            (TEmbeddedItem | TPage)[]
          >

          if (options.replace) {
            groupedCache.current = res
          } else {
            for (const key of Object.keys(res)) {
              const existing = groupedCache.current[key] || []
              const incoming = res[key]

              const deduped = incoming.filter(
                (newItem) =>
                  !existing.some((i) => i.id === newItem.id)
              )

              groupedCache.current[key] = [...existing, ...deduped]
            }
          }

          // Flatten for filtering/search
          const flat = Object.values(groupedCache.current).flat()

          fullResultsCache.current = flat
          setGroupedItems(groupedCache.current)
          setItems(applyFilter(flat, currentQuery, currentSort))
        } else {
          const normalized = normalizeItems<TEmbeddedItem | TPage>(
            data.res
          )

          const newItems = options.replace
            ? normalized
            : normalized.filter(
                (newItem) =>
                  !fullResultsCache.current.some(
                    (i) => i.id === newItem.id
                  )
              )

          fullResultsCache.current = options.replace
            ? newItems
            : [...fullResultsCache.current, ...newItems]
          setItems(
            applyFilter(
              fullResultsCache.current,
              currentQuery,
              currentSort
            )
          )
        }
        setNextCursor(data.nextCursor)
        setCount(data.totalCount)
        if (options.replace) {
          hasLoadedInitialRef.current = true
        }
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

  const getFilteredGroupedItems = useCallback(() => {
    if (!groupedItems) return null

    const result: Record<string, (TEmbeddedItem | TPage)[]> = {}

    for (const key of Object.keys(groupedItems)) {
      result[key] = applyFilter(
        groupedItems[key],
        queryRef.current,
        sortDirectionRef.current
      )
    }

    return result
  }, [groupedItems, applyFilter])

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (!nextCursor || isFetchingRef.current) return
    await fetchPage({ cursor: nextCursor })
  }, [nextCursor, fetchPage])

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) {
        observerRef.current?.disconnect()
        observerRef.current = null
        return
      }

      if (!nextCursor) return

      observerRef.current?.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore()
        },
        { threshold: 0.1 }
      )

      observerRef.current.observe(node)
    },
    [loadMore, nextCursor]
  )

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
        setItems(
          applyFilter(fullResultsCache.current, query, sortDirection)
        )
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

  // Client-side draft augmentation. When the page rendered published-only
  // data statically, refetch page 1 once the visitor's session resolves as
  // admin — revealing unpublished drafts with no auth() in the static render
  // path. Anonymous visitors skip the refetch (they'd get identical published
  // data); the session check is UX only, the API gates drafts on the cookie.
  const isAdmin = useIsAdmin(!!augmentOnMount)
  const didAugmentRef = useRef(false)
  useEffect(() => {
    if (!augmentOnMount || !isAdmin || didAugmentRef.current) return
    didAugmentRef.current = true
    fetchPage({ replace: true })
  }, [augmentOnMount, isAdmin, fetchPage])

  // Client-side seeding. When no `initial` results are passed, fetch the
  // first page so the list populates without the caller threading server
  // data down (e.g. the about cover-image picker). An explicit empty
  // response seeds an empty list without a fetch. Exposed as
  // `ensureFirstPage`, safe to call repeatedly (e.g. on mount and again
  // on focus): it no-ops while a fetch is in flight or once one has
  // completed, but retries if the prior attempt was aborted before
  // finishing, so a caller doesn't get stuck with an empty list.
  const ensureFirstPage = useCallback(() => {
    if (initial !== undefined) return
    if (hasLoadedInitialRef.current || isFetchingRef.current) return
    fetchPage({ replace: true })
  }, [initial, fetchPage])

  useEffect(() => {
    ensureFirstPage()
  }, [ensureFirstPage])

  function onRemoveItem(itemId: string) {
    fullResultsCache.current = fullResultsCache.current.filter(
      (i) => i.id !== itemId
    )
    setItems(
      applyFilter(
        fullResultsCache.current,
        queryRef.current,
        sortDirectionRef.current
      )
    )
    setCount((prevCount) => prevCount - 1)
  }

  return {
    count,
    ensureFirstPage,
    isLoading,
    items, // flat
    groupedItems: getFilteredGroupedItems(), // grouped
    loadMoreRef,
    query,
    setQuery,
    sortDirection,
    setSortDirection,
    nextCursor,
    onRemoveItem,
    totalCount
  }
}
