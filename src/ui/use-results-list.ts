import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'

import type {
  EmbeddedItem,
  PageDataResponse,
  PageItemClient,
  PageItemResponseWithCursor
} from '@/lib/types'
import type { ResponseWithCursor } from '@/lib/util'
import { useIsAdmin } from '@/ui/useIsAdmin'
import { buildApiUrl, type SearchParams } from '@/ui/util'
import { withViewTransition } from '@/ui/view-transition'

/** How long typing pauses before the search is sent */
export const SEARCH_DEBOUNCE_MS = 250

export type ResultsResponse<
  TEmbeddedItem extends EmbeddedItem,
  TPage extends PageItemClient,
  S extends PageDataResponse | undefined = undefined
> = S extends PageDataResponse
  ? PageItemResponseWithCursor<TPage, S>
  : ResponseWithCursor<TEmbeddedItem>

type Results<T> = {
  /** A flat page, or a grouped one (e.g. events by category) */
  res: T[] | Record<string, T[]>
  nextCursor: string | null
  totalCount: number
}

const emptyResults = { res: [], nextCursor: null, totalCount: 0 }

/**
 * Fetch paginated results with infinite scroll and server-side
 * search: a query change (debounced) refetches the first page for
 * that query, and later pages continue its cursor.
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
     * `{ projectId }` to scope to a parent, or `{ type: 'press' }` to
     * restrict images/links to press items.
     */
    searchParams?: SearchParams
  } = {}
) {
  type Item = TEmbeddedItem | TPage

  const [query, setQuery] = useState(defaultQuery || '')
  const [results, setResults] = useState<Results<Item>>(
    (initial as Results<Item> | undefined) ?? emptyResults
  )
  const [isLoading, setIsLoading] = useState(false)
  /**
   * The query the current results (and their cursor) belong to. Set
   * only once a fetch for it succeeds, so a failed search keeps the
   * shown results and their cursor consistent.
   */
  const [resultsQuery, setResultsQuery] = useState(query)
  const resultsQueryRef = useRef(query)
  /** The latest typed query, for refetches outside the debounce */
  const queryRef = useRef(query)
  useEffect(() => {
    queryRef.current = query
  }, [query])
  /** The in-flight fetch, if any; aborted by the next first-page fetch */
  const controllerRef = useRef<AbortController | null>(null)
  /** The query the in-flight fetch is for */
  const inFlightQueryRef = useRef<string | null>(null)
  /** Whether the in-flight fetch is a later page */
  const isPagingRef = useRef(false)
  /**
   * Whether a later page was skipped or aborted for another fetch, so
   * a sentinel already in view has no notification left to resume it
   */
  const isPagingStalledRef = useRef(false)
  /** Recreates the scroll observer, which reports a visible sentinel */
  const [pagingKey, rearmPaging] = useReducer((n: number) => n + 1, 0)
  const hasLoadedFirstPageRef = useRef(false)
  const isSeeded = initial !== undefined
  /** A first-page query whose fetch failed, for `ensureFirstPage` to retry */
  const failedQueryRef = useRef<string | null>(null)
  /** Whether fetches include drafts, i.e. the admin augment is on */
  const didAugmentRef = useRef(false)
  /** Whether the shown first page was fetched with drafts */
  const isResultsAugmentedRef = useRef(false)
  /** Whether logout cleared the shown results, pending a refetch */
  const isResultsClearedRef = useRef(false)

  // Compared by value so callers can pass an inline `searchParams`
  // object without destabilizing the memoized `fetchPage`.
  const searchParamsKey = JSON.stringify(searchParams ?? {})

  const fetchPage = useCallback(
    async (
      pageQuery: string,
      {
        cursor,
        isAnimated
      }: {
        /** Omit to replace the results with the first page */
        cursor?: string
        /** animate the resulting reflow, see `withViewTransition` */
        isAnimated?: boolean
      } = {}
    ) => {
      if (controllerRef.current && isPagingRef.current) {
        isPagingStalledRef.current = true
      }
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      inFlightQueryRef.current = pageQuery
      isPagingRef.current = !!cursor
      let isFailed = false
      const isAugmented = didAugmentRef.current
      setIsLoading(true)

      try {
        const res = await fetch(
          buildApiUrl(apiEndpoint, {
            query: pageQuery,
            cursor,
            ...JSON.parse(searchParamsKey)
          }),
          { signal: controller.signal }
        )
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`)
        }
        const data: Results<Item> = await res.json()
        // superseded or cancelled while the response was read
        if (controllerRef.current !== controller) return

        const apply = () => {
          // a view transition defers this; recheck for a newer fetch
          if (controllerRef.current !== controller) return
          resultsQueryRef.current = pageQuery
          setResults((prev) =>
            cursor ? appendPage(prev, data) : data
          )
          setResultsQuery(pageQuery)
          if (!cursor) {
            hasLoadedFirstPageRef.current = true
            isResultsAugmentedRef.current = isAugmented
            isResultsClearedRef.current = false
            failedQueryRef.current = null
          }
        }
        if (isAnimated) await withViewTransition(apply)
        else apply()
      } catch (err: Error | unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Fetch page error:', err)
          isFailed = true
          if (!cursor) failedQueryRef.current = pageQuery
        }
      } finally {
        // An aborted fetch mustn't clear a newer one's in-flight state.
        if (controllerRef.current === controller) {
          controllerRef.current = null
          inFlightQueryRef.current = null
          isPagingRef.current = false
          setIsLoading(false)
          // not after a failed later page, which would retry it in a
          // loop; a failed search keeps the shown cursor, so resume it
          if (isPagingStalledRef.current && (!isFailed || !cursor)) {
            isPagingStalledRef.current = false
            rearmPaging()
          }
        }
      }
    },
    [apiEndpoint, searchParamsKey]
  )

  // A changed query refetches from the first page, once typing pauses.
  // Returning to the shown results' query cancels a search still in
  // flight for another one, so its response can't replace them.
  useEffect(() => {
    if (query === resultsQueryRef.current) {
      if (inFlightQueryRef.current === query) return
      if (controllerRef.current) {
        controllerRef.current.abort()
        controllerRef.current = null
        inFlightQueryRef.current = null
        isPagingRef.current = false
        setIsLoading(false)
      }
      // a search, even one that since failed, may have aborted the
      // mount fetch, the session refresh (or logout refetch) of the
      // shown results, or their next page
      if (
        (!isSeeded && !hasLoadedFirstPageRef.current) ||
        isResultsClearedRef.current ||
        isResultsAugmentedRef.current !== didAugmentRef.current
      ) {
        fetchPage(query, { isAnimated: didAugmentRef.current })
      } else if (isPagingStalledRef.current) {
        isPagingStalledRef.current = false
        rearmPaging()
      }
      return
    }
    const timer = setTimeout(
      () => fetchPage(query),
      SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timer)
  }, [query, fetchPage, isSeeded])

  const { nextCursor } = results
  const loadMore = useCallback(() => {
    if (!nextCursor) return
    // a queued observer callback from before a new search replaced
    // the results; its cursor belongs to the old query
    if (resultsQuery !== resultsQueryRef.current) return
    if (controllerRef.current) {
      isPagingStalledRef.current = true
      return
    }
    fetchPage(resultsQuery, { cursor: nextCursor })
  }, [nextCursor, resultsQuery, fetchPage])

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLLIElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!node || !nextCursor) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore()
        },
        { threshold: 0.1 }
      )
      observerRef.current.observe(node)
    },
    // pagingKey re-arms the observer
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadMore, nextCursor, pagingKey]
  )

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
      controllerRef.current = null
    }
  }, [])

  // For admins, refetch the first page to reveal unpublished content;
  // on logout, refetch it again so the drafts don't stay listed.
  const isAdmin = useIsAdmin(!!augmentOnMount)
  useEffect(() => {
    if (!augmentOnMount || isAdmin === didAugmentRef.current) return
    didAugmentRef.current = isAdmin
    // drafts mustn't outlive the session, even if the refetch fails;
    // a later page may have appended some after a failed first page
    if (!isAdmin) {
      isResultsAugmentedRef.current = false
      isResultsClearedRef.current = true
      setResults(
        initial && resultsQueryRef.current === (defaultQuery || '')
          ? (initial as Results<Item>)
          : emptyResults
      )
    }
    fetchPage(queryRef.current, { isAnimated: isAdmin })
  }, [augmentOnMount, isAdmin, fetchPage, initial, defaultQuery])

  // If no initial results are passed from the server, fetch the first
  // page on mount; later calls (e.g. on focus) also retry the current
  // query if its search failed.
  const ensureFirstPage = useCallback(() => {
    if (controllerRef.current) return
    if (failedQueryRef.current === query) {
      fetchPage(query)
      return
    }
    if (initial !== undefined || hasLoadedFirstPageRef.current) return
    fetchPage(query)
  }, [initial, fetchPage, query])

  useEffect(() => {
    ensureFirstPage()
    // mount only; later calls come from the caller (focus, typing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groupedItems = Array.isArray(results.res) ? null : results.res
  const items = useMemo(
    () =>
      groupedItems
        ? Object.values(groupedItems).flat()
        : (results.res as Item[]),
    [groupedItems, results.res]
  )

  return {
    count: results.totalCount,
    ensureFirstPage,
    isLoading,
    items,
    groupedItems,
    loadMoreRef,
    query,
    /** The query the listed results belong to, for headings */
    resultsQuery,
    setQuery,
    nextCursor,
    /** Total count of the server-seeded first page */
    totalCount: initial?.totalCount ?? 0
  }
}

/** Appends a later page, skipping items already listed */
function appendPage<T extends { id: string }>(
  prev: Results<T>,
  page: Results<T>
): Results<T> {
  const seen = new Set(flatten(prev.res).map((item) => item.id))
  const isNew = (item: T) => !seen.has(item.id)

  let res: Results<T>['res']
  if (Array.isArray(page.res)) {
    res = [...flatten(prev.res), ...page.res.filter(isNew)]
  } else {
    const grouped = Array.isArray(prev.res) ? {} : { ...prev.res }
    for (const [key, group] of Object.entries(page.res)) {
      grouped[key] = [...(grouped[key] ?? []), ...group.filter(isNew)]
    }
    res = grouped
  }
  return { ...page, res }
}

function flatten<T>(res: Results<T>['res']): T[] {
  return Array.isArray(res) ? res : Object.values(res).flat()
}
